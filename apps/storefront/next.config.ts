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
};

export default nextConfig;
