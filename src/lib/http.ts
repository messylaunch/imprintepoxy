import { NextResponse } from "next/server";
import { db } from "./db";

export const ok = (data: unknown = { ok: true }) => NextResponse.json(data);
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

const MAX = 12 * 1024 * 1024;
export async function saveUpload(file: File, userId?: string | null) {
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > MAX) throw new Error("Image is too large (max 12 MB).");
  const buf = Buffer.from(await file.arrayBuffer());
  const u = await db.upload.create({ data: { mime: file.type, data: buf, userId: userId ?? null } });
  return { id: u.id, url: `/api/uploads/${u.id}` };
}

export const clean = (s: unknown, max = 200) => (typeof s === "string" ? s.trim().slice(0, max) : "");
export const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
