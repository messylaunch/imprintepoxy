import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { staffUser } from "@/lib/staff";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await staffUser())) return fail("Forbidden", 403);
  const { id } = await params;
  const conv = await db.conversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!conv) return fail("Not found", 404);
  if (conv.staffUnread) await db.conversation.update({ where: { id }, data: { staffUnread: false } });
  return ok({ messages: conv.messages });
}
