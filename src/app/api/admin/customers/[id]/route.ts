import { db } from "@/lib/db";
import { clean, fail, ok } from "@/lib/http";
import { staffUser } from "@/lib/staff";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await staffUser())) return fail("Forbidden", 403);
  const b = await req.json();
  return ok({ user: await db.user.update({ where: { id: (await params).id }, data: { notes: clean(b.notes, 4000) } }) });
}
