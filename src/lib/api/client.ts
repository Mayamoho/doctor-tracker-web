import type { ApiFailure, PageMeta, ValidationIssue } from './types';

/** Everything goes through the Next rewrite, so the browser stays same-origin and the auth cookies are first-party. */
const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    readonly message: string,
    readonly code: string,
    readonly status: number,
    readonly issues: ValidationIssue[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Field-keyed issues, so a form can show each message under its own input. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.issues.map((issue) => [issue.field, issue.message]));
  }
}

function toIssues(details: unknown): ValidationIssue[] {
  if (!Array.isArray(details)) return [];
  return details.filter(
    (issue): issue is ValidationIssue =>
      typeof issue === 'object' && issue !== null && 'field' in issue && 'message' in issue,
  );
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  meta?: PageMeta;
  error?: ApiFailure['error'];
}

export interface ListResult<T> {
  items: T[];
  meta: PageMeta;
}

/**
 * A successful single-resource envelope always carries `data`; the field is
 * optional only because list routes share this type. Unwrapping here keeps
 * `T | undefined` from spreading into every call site.
 */
export async function one<T>(request: Promise<Envelope<T>>): Promise<T> {
  const body = await request;
  if (body.data === undefined) throw new ApiError('Missing response data', 'BAD_RESPONSE', 200);
  return body.data;
}

/**
 * Concurrent 401s collapse into one refresh call. A dashboard that fires four
 * queries with an expired access token would otherwise make four refresh requests,
 * each doing a user lookup and each overwriting the same two cookies. The server
 * does not revoke on refresh (see `authService.refresh`), so this is wasted work
 * rather than a race — but four identical writes to the cookie jar per expiry is
 * still worth deduplicating.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'same-origin',
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function parse<T>(response: Response): Promise<Envelope<T>> {
  try {
    return (await response.json()) as Envelope<T>;
  } catch {
    throw new ApiError('The server returned an unreadable response', 'BAD_RESPONSE', response.status);
  }
}

async function send<T>(
  path: string,
  init: RequestInit,
  retryOnUnauthorized: boolean,
): Promise<Envelope<T>> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  if (response.status === 401 && retryOnUnauthorized && (await refreshSession())) {
    return send<T>(path, init, false);
  }

  const body = await parse<T>(response);

  if (!response.ok || !body.success) {
    const error = body.error ?? { code: 'UNKNOWN', message: 'Request failed' };
    throw new ApiError(error.message, error.code, response.status, toIssues(error.details));
  }

  return body;
}

export const api = {
  /** Reads are never cached: this is an admin portal over live records, and a stale list after a mutation is worse than an extra request. */
  get: async <T>(path: string, signal?: AbortSignal): Promise<Envelope<T>> =>
    send<T>(path, { method: 'GET', cache: 'no-store', signal }, true),

  getList: async <T>(path: string, signal?: AbortSignal): Promise<ListResult<T>> => {
    const body = await api.get<T[]>(path, signal);
    if (!body.meta) throw new ApiError('Missing pagination meta', 'BAD_RESPONSE', 200);
    return { items: body.data ?? [], meta: body.meta };
  },

  post: <T>(path: string, payload?: unknown) =>
    send<T>(path, { method: 'POST', body: JSON.stringify(payload ?? {}) }, true),

  patch: <T>(path: string, payload: unknown) =>
    send<T>(path, { method: 'PATCH', body: JSON.stringify(payload) }, true),

  delete: <T>(path: string) => send<T>(path, { method: 'DELETE' }, true),
};

export function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
