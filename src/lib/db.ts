import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

// On Vercel the project folder is read-only. Until a real Postgres database is
// connected, copy the bundled, pre-seeded demo SQLite file to /tmp and use that.
// Demo data resets whenever Vercel starts a fresh server instance.
function demoUrl(): string | undefined {
  const url = process.env.DATABASE_URL ?? "";
  if (!process.env.VERCEL || url.startsWith("postgres")) return undefined;
  const target = "/tmp/imprint-demo.db";
  if (!fs.existsSync(target)) {
    const src = path.join(process.cwd(), "prisma", "demo.db");
    fs.copyFileSync(src, target);
  }
  process.env.DATABASE_URL = `file:${target}`;
  return `file:${target}`;
}

const g = globalThis as unknown as { prisma?: PrismaClient };
const url = demoUrl();
export const db = g.prisma ?? new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
if (process.env.NODE_ENV !== "production") g.prisma = db;
