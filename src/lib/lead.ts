import { db } from "./db";
import { getUser, startSession, touch } from "./auth";
import { clean, emailOk } from "./http";

/** Current user, or create a lightweight lead account from name/email (and log them in). */
export async function userOrLead(input: { name?: unknown; email?: unknown; phone?: unknown }, source: string) {
  const u = await getUser();
  if (u) {
    await touch(u.id);
    return { user: u };
  }
  const name = clean(input.name, 80);
  const email = clean(input.email).toLowerCase();
  if (!name || !emailOk(email)) return { error: "Add your name and email so we can reply" };
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Looks like you've been here before. Sign in so we can keep everything together." };
  const user = await db.user.create({ data: { name, email, phone: clean(input.phone, 30) || null, source } });
  await startSession(user.id);
  return { user };
}
