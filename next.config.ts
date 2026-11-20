import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
  // ship the pre-seeded demo database with every server function (see src/lib/db.ts)
  outputFileTracingIncludes: { "/**": ["./prisma/demo.db"] },
};

export default nextConfig;
