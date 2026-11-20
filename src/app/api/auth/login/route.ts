import { db } from "@/lib/db";
import { checkPassword, publicUser, startSession } from "@/lib/auth";
import { clean, fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  const b = await req.json();
  const user = await db.user.findUnique({ where: { email: clean(b.email).toLowerCase() } });
  if (!user?.passwordHash || !(await checkPassword(String(b.password ?? ""), user.passwordHash))) return fail("Email or password is wrong", 401);
  await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
  await startSession(user.id);
  return ok({ user: publicUser(user) });
}
