import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { clean, fail, ok } from "@/lib/http";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return fail("Sign in first", 401);
  const b = await req.json();
  const p = await db.project.create({ data: { userId: user.id, name: clean(b.name, 60) || "My Project" } });
  return ok({ project: p });
}
