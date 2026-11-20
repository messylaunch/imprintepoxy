import { db } from "@/lib/db";
import { clean, fail, ok, saveUpload } from "@/lib/http";
import { userOrLead } from "@/lib/lead";

export async function POST(req: Request) {
  const fd = await req.formData();
  const g = (k: string) => fd.get(k);
  const details = clean(g("details"), 3000);
  if (!details) return fail("Tell us a bit about the idea");
  const r = await userOrLead({ name: g("name"), email: g("email"), phone: g("phone") }, "request");
  if (!r.user) return fail(r.error!);
  const user = r.user;

  const conv = await db.conversation.create({ data: { userId: user.id, topic: "custom" } });
  const lines = [`SPECIAL REQUEST: ${clean(g("kind"), 40)}`, details];
  if (clean(g("budget"))) lines.push(`Budget: ${clean(g("budget"), 40)}`);
  if (clean(g("deadline"))) lines.push(`Needed by: ${clean(g("deadline"), 20)}`);
  await db.message.create({ data: { conversationId: conv.id, authorName: user.name, body: lines.join("\n") } });

  const files = fd.getAll("files").filter((f): f is File => f instanceof File).slice(0, 10);
  for (const f of files) {
    try {
      const u = await saveUpload(f, user.id);
      await db.message.create({ data: { conversationId: conv.id, authorName: user.name, body: "📎 Reference image", attachmentId: u.id } });
    } catch {}
  }
  await db.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: new Date() } });
  return ok({ conversationId: conv.id });
}
