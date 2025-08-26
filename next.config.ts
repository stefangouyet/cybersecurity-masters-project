import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    dirs: ['src/'],
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,

  },
}

export default nextConfig;
