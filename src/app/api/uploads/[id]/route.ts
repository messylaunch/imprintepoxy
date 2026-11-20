import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await db.upload.findUnique({ where: { id } });
  if (!u) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(u.data), { headers: { "content-type": u.mime, "cache-control": "public, max-age=31536000, immutable" } });
}
