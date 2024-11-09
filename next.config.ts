import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "27.79.144.101",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
