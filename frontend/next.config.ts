import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://rased-avf8-64c1os9rt-darwish1231s-projects.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;
