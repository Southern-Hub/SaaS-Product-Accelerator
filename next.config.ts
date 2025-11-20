import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Removed output: 'export' to support API routes on Vercel
};

export default nextConfig;
