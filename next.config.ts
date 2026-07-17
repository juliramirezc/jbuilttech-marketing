import type { NextConfig } from "next";
import path from "path";

/** Absolute project root — prevents Next/Turbopack from walking up to parent lockfiles */
const projectRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin file tracing to this app (npm run build)
  outputFileTracingRoot: projectRoot,
  // Pin Turbopack module resolution root (npm run dev --turbopack)
  turbopack: {
    root: projectRoot,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Quality settings for Next.js 15/16 compatibility
    qualities: [75, 90, 95],
  },
};

export default nextConfig;
