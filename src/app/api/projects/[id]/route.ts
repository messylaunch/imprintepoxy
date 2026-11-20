import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { clean, fail, ok } from "@/lib/http";

async function own(id: string) {
  const user = await getUser();
  if (!user) return null;
  return db.project.findFirst({ where: { id, userId: user.id } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await own((await params).id);
  if (!p) return fail("Not found", 404);
  const b = await req.json();
  return ok({ project: await db.project.update({ where: { id: p.id }, data: { name: clean(b.name, 60) || p.name } }) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await own((await params).id);
  if (!p) return fail("Not found", 404);
  await db.project.delete({ where: { id: p.id } });
  return ok();
}
