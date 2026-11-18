import type { NextConfig } from "next";

// All browser calls go to /api/* on this app and are proxied to the backend.
// This keeps the login cookie on the same origin, so no CORS setup is needed.
const backend = process.env.BACKEND_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
