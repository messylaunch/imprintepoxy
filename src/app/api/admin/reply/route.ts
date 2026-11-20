import { db } from "@/lib/db";
import { clean, fail, ok } from "@/lib/http";
import { staffUser } from "@/lib/staff";

export async function POST(req: Request) {
  const staff = await staffUser();
  if (!staff) return fail("Forbidden", 403);
  const b = await req.json();
  const conv = await db.conversation.findUnique({ where: { id: b.conversationId } });
  if (!conv) return fail("Not found", 404);
  if (b.status) {
    await db.conversation.update({ where: { id: conv.id }, data: { status: b.status === "CLOSED" ? "CLOSED" : "OPEN" } });
    return ok();
  }
  const body = clean(b.body, 2000);
  if (!body) return fail("Type a reply");
  const message = await db.message.create({ data: { conversationId: conv.id, body, fromStaff: true, authorName: staff.name.split(" ")[0] } });
  await db.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: new Date(), userUnread: true, staffUnread: false } });
  return ok({ message });
}
