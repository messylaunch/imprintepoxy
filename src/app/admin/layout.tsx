import Link from "next/link";
import { redirect } from "next/navigation";
import { staffUser } from "@/lib/staff";
import { db } from "@/lib/db";
import { AdminNav } from "./nav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Owner" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await staffUser();
  if (!staff) redirect("/login");
  const unread = await db.conversation.count({ where: { staffUnread: true, status: "OPEN" } });
  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Owner dashboard</p>
          <p className="text-sm text-muted">Signed in as {staff.name} ({staff.role.toLowerCase()})</p>
        </div>
        <Link href="/" className="font-tag text-xs text-muted hover:text-fg">View site →</Link>
      </div>
      <AdminNav unread={unread} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
