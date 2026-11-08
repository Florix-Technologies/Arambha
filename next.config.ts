import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
    ] }];
  },
  // One canonical host: the bare domain moves permanently to www (path and query kept).
  async redirects() {
    return [{ source: '/:path*', has: [{ type: 'host', value: 'arambhainteriorstudio.com' }], destination: 'https://www.arambhainteriorstudio.com/:path*', permanent: true }];
  },
};

export default nextConfig;
