import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { clean, fail, ok } from "@/lib/http";

async function own(id: string) {
  const user = await getUser();
  if (!user) return null;
  return db.design.findFirst({ where: { id, project: { userId: user.id } } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const d = await own((await params).id);
  if (!d) return fail("Not found", 404);
  const b = await req.json();
  const data: { liked?: boolean; name?: string } = {};
  if (typeof b.liked === "boolean") data.liked = b.liked;
  if (b.name) data.name = clean(b.name, 80);
  return ok({ design: await db.design.update({ where: { id: d.id }, data }) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const d = await own((await params).id);
  if (!d) return fail("Not found", 404);
  await db.design.delete({ where: { id: d.id } });
  return ok();
}
