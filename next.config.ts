import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "promex04.myvnc.com",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
