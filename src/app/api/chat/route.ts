import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { clean, fail, ok } from "@/lib/http";
import { userOrLead } from "@/lib/lead";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return ok({ conversations: [], user: null });
  const c = new URL(req.url).searchParams.get("c");
  if (c) {
    const conv = await db.conversation.findFirst({ where: { id: c, userId: user.id }, include: { project: { select: { id: true, name: true } }, messages: { orderBy: { createdAt: "asc" } } } });
    if (!conv) return fail("Not found", 404);
    if (conv.userUnread) await db.conversation.update({ where: { id: c }, data: { userUnread: false } });
    return ok({ conversation: conv });
  }
  const conversations = await db.conversation.findMany({
    where: { userId: user.id },
    orderBy: { lastMessageAt: "desc" },
    include: { project: { select: { id: true, name: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const projects = await db.project.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true } });
  return ok({ conversations, projects, unread: conversations.some((c) => c.userUnread) });
}

export async function POST(req: Request) {
  const b = await req.json();
  const body = clean(b.body, 2000);
  if (!body) return fail("Type a message");
  const r = await userOrLead(b.lead ?? {}, "chat");
  if (!r.user) return fail(r.error!, 400);
  const user = r.user;

  let conv = b.conversationId ? await db.conversation.findFirst({ where: { id: b.conversationId, userId: user.id } }) : null;
  if (!conv) {
    let projectId: string | null = null;
    if (b.projectId) {
      const p = await db.project.findFirst({ where: { id: b.projectId, userId: user.id } });
      projectId = p?.id ?? null;
    }
    conv = await db.conversation.create({ data: { userId: user.id, topic: projectId ? "project" : "general", projectId } });
  }
  const msg = await db.message.create({ data: { conversationId: conv.id, body, authorName: user.name, fromStaff: false } });
  await db.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: new Date(), staffUnread: true, status: "OPEN" } });
  return ok({ conversationId: conv.id, message: msg, newUser: !b.lead ? undefined : { id: user.id, name: user.name } });
}
