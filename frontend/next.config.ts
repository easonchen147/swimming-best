import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const configDir = dirname(fileURLToPath(import.meta.url));

const backendOrigin = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: configDir,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/compare",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
