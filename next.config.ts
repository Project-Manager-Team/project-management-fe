import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "27.79.177.183",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
