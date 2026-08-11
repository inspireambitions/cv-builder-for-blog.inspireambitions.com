import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel creates its own function traces. Local E2E tests use the standalone server.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas", "sharp"],
};

export default nextConfig;
