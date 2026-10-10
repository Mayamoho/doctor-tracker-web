import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  /**
   * Next 16 refuses to serve dev assets (`/_next/hmr`, client chunks) to any
   * origin other than `localhost`. Opening the portal at `http://127.0.0.1:3000`
   * then yields a page that renders but never hydrates — the forms fall back to
   * native GET submits and the whole app looks broken. Allow the loopback alias.
   */
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  /**
   * The API is a separate Express app. Proxying it under the same origin is what
   * makes the auth cookies first-party — `SameSite=Lax` host-only cookies are the
   * only arrangement Safari's ITP does not block, and it is what
   * doctor-tracker-api/src/utils/cookies.ts is written against.
   *
   * Point `API_INTERNAL_URL` at the Render service in production; the browser
   * never sees that host.
   */
  async rewrites() {
    const api = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:5000";
    return [{ source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` }];
  },
};

export default nextConfig;
