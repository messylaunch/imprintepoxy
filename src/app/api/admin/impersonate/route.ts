import { db } from "@/lib/db";
import { endImpersonation, startImpersonation } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { staffUser } from "@/lib/staff";

export async function POST(req: Request) {
  if (!(await staffUser())) return fail("Forbidden", 403);
  const { userId } = await req.json();
  const u = await db.user.findUnique({ where: { id: userId } });
  if (!u) return fail("Not found", 404);
  await startImpersonation(u.id);
  return ok();
}
export async function DELETE() {
  await endImpersonation();
  return ok();
}
