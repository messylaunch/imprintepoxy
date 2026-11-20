import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { User } from "@prisma/client";

const SESSION = "ie_session";
const AS = "ie_as"; // staff "view as customer"
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const checkPassword = (p: string, h: string) => bcrypt.compare(p, h);

async function sign(uid: string) {
  return new SignJWT({ uid }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("60d").sign(secret());
}
async function verify(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}

const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export async function startSession(uid: string) {
  (await cookies()).set(SESSION, await sign(uid), { ...cookieOpts, maxAge: 60 * 60 * 24 * 60 });
}
export async function endSession() {
  const c = await cookies();
  c.delete(SESSION);
  c.delete(AS);
}
export async function startImpersonation(uid: string) {
  (await cookies()).set(AS, await sign(uid), { ...cookieOpts, maxAge: 60 * 60 * 4 });
}
export async function endImpersonation() {
  (await cookies()).delete(AS);
}

export const isStaff = (u?: Pick<User, "role"> | null) => !!u && (u.role === "STAFF" || u.role === "OWNER");

export type Session = { user: User; realUser: User; impersonating: boolean };

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const uid = await verify(c.get(SESSION)?.value);
  if (!uid) return null;
  const realUser = await db.user.findUnique({ where: { id: uid } });
  if (!realUser) return null;
  if (isStaff(realUser)) {
    const asId = await verify(c.get(AS)?.value);
    if (asId && asId !== realUser.id) {
      const as = await db.user.findUnique({ where: { id: asId } });
      if (as) return { user: as, realUser, impersonating: true };
    }
  }
  return { user: realUser, realUser, impersonating: false };
}

export async function getUser() {
  return (await getSession())?.user ?? null;
}

export async function touch(uid: string) {
  await db.user.update({ where: { id: uid }, data: { lastSeenAt: new Date() } }).catch(() => {});
}

export function publicUser(u: User | null) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, state: u.state, city: u.city, role: u.role, hasPassword: !!u.passwordHash };
}
export type PublicUser = NonNullable<ReturnType<typeof publicUser>>;
