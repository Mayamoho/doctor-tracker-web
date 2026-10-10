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
const REFRESH_COOKIE = 'dt_rt';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value || request.cookies.get(REFRESH_COOKIE)?.value,
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
