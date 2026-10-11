import { NextResponse, type NextRequest } from 'next/server';

/**
 * Coarse gate only: it checks that a session cookie *exists*, not that it verifies.
 * A tampered or expired cookie passes here and is rejected by the API itself,
 * which runs `requireAuth` on every route — the browser cannot reach data this
 * file lets through. Doing the real check here would mean duplicating JWT
 * verification and the access-token secret into the frontend.
 *
 * It exists so an unauthenticated visitor never sees a flashing empty dashboard.
 */
const ACCESS_COOKIE = 'dt_at';
/**
 * The session marker, not the refresh cookie. `dt_rt` is path-scoped to
 * `/api/v1/auth`, so it is never attached to a navigation to `/dashboard`;
 * gating on it means a 15-minute-old access token silently logs people out at
 * the door even though the client can refresh on a 401. `dt_s` is sent on every
 * request to this origin and holds no credential.
 */
const SESSION_COOKIE = 'dt_s';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value || request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (pathname.startsWith('/api')) return NextResponse.next();

  if (!signedIn && pathname !== '/login') {
    const url = new URL('/login', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (signedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Every internal path is excluded, not just static assets. Matching `/_next/*`
   * as a whole is what keeps the HMR websocket and the RSC chunk requests from
   * being redirected to `/login` — a signed-out visitor asking for any of them
   * would otherwise get a redirect where a script or a socket upgrade was due,
   * and the page would ship as inert HTML that never hydrates.
   */
  matcher: ['/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp)$).*)'],
};
