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
      // 2. Production Domains (NRG Solar Live Server)
      {
        protocol: "https",
        hostname: "nrgsolarbd.com",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "nrgsolarbd.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "www.nrgsolarbd.com",
        pathname: "/storage/**",
      },
      // 3. Universal wildcard fallback
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