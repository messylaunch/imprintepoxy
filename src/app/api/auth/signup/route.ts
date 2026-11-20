import { db } from "@/lib/db";
import { hashPassword, publicUser, startSession } from "@/lib/auth";
import { clean, emailOk, fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  const b = await req.json();
  const email = clean(b.email).toLowerCase();
  const name = clean(b.name, 80);
  const password = typeof b.password === "string" ? b.password : "";
  if (!name) return fail("Tell us your name");
  if (!emailOk(email)) return fail("That email doesn't look right");
  if (password.length < 6) return fail("Password needs at least 6 characters");
  const existing = await db.user.findUnique({ where: { email } });
  if (existing?.passwordHash) return fail("You already have an account. Sign in instead.");
  const data = { name, email, phone: clean(b.phone, 30) || null, state: clean(b.state, 2) || null, passwordHash: await hashPassword(password), lastSeenAt: new Date() };
  // A lead from chat/checkout can claim their record by signing up with the same email.
  const user = existing ? await db.user.update({ where: { id: existing.id }, data }) : await db.user.create({ data: { ...data, source: "signup" } });
  await startSession(user.id);
  return ok({ user: publicUser(user) });
}
