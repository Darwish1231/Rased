import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://rased-avf8.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;
