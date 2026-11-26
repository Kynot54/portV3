import type { NextConfig } from "next";
import { assertPublicEnv } from "./src/lib/contact/config";
import { securityHeaders } from "./src/lib/security-headers";

assertPublicEnv(process.env);

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env) }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
