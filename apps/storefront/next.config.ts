import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@luxe-maison/shared"],
  serverExternalPackages: ["mongoose"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
