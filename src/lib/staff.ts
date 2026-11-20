import { getSession, isStaff } from "./auth";

/** Real (non-impersonated) staff user, or null. */
export async function staffUser() {
  const s = await getSession();
  return s && isStaff(s.realUser) ? s.realUser : null;
}
