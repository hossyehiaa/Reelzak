import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow the Z.ai preview gateway host in dev (does not affect Vercel prod).
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
