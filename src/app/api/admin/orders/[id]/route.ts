import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { staffUser } from "@/lib/staff";

const STATUSES = ["PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED", "CANCELLED"];
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await staffUser())) return fail("Forbidden", 403);
  const { status } = await req.json();
  if (!STATUSES.includes(status)) return fail("Bad status");
  return ok({ order: await db.order.update({ where: { id: (await params).id }, data: { status } }) });
}
