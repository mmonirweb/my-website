import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // 1. Local Development (Laravel Backend)
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      // 2. Production Domain (লাইভ সার্ভারের জন্য)
      {
        protocol: "https",
        hostname: "zarahmart.com",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "zarahmart.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api.zarahmart.com",
        pathname: "/storage/**",
      },
      // 3. Universal wildcard: যেকোনো এক্সটার্নাল বা থার্ড-পার্টি সাইট থেকে ছবি আসার অনুমতি দিতে
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;