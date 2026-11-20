import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderHeart, Package, Shield } from "lucide-react";
import { getSession, isStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { money } from "@/lib/design";
import { SignOut } from "./sign-out";
import { AuthForm } from "@/components/auth-sheet";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

const STATUS: Record<string, string> = { PAID: "Paid", IN_PRODUCTION: "Pouring", READY: "Ready", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled" };

export default async function Account() {
  const s = await getSession();
  if (!s) redirect("/login");
  const u = s.user;
  const [orders, projects] = await Promise.all([
    db.order.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } }),
    db.project.findMany({ where: { userId: u.id }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { designs: true } } } }),
  ]);
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-tag text-xs text-red">My account</p>
          <h1 className="font-display mt-2 text-6xl font-black md:text-7xl"><span className="chrome-text">{u.name}</span></h1>
          <p className="mt-2 text-sm text-muted">{u.email}{u.phone && ` · ${u.phone}`}{u.state && ` · ${u.state}`}</p>
        </div>
        <div className="flex gap-2">
          {isStaff(s.realUser) && <Link href="/admin" className="btn btn-ghost"><Shield size={16} /> Owner dashboard</Link>}
          {!s.impersonating && <SignOut />}
        </div>
      </div>

      {!u.passwordHash && !s.impersonating && (
        <div className="panel mt-8 grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-black">Set a password</h2>
            <p className="mt-1 text-sm text-muted">So you can sign in from any device and keep your projects. Use the same email: {u.email}</p>
          </div>
          <AuthForm />
        </div>
      )}

      <h2 className="font-display mt-12 flex items-center gap-2 text-4xl font-black"><Package className="text-red" /> Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {orders.map((o) => (
            <Link key={o.id} href={`/order/${o.id}`} className="panel press flex items-center justify-between p-4">
              <span>
                <span className="font-semibold">#{o.number}</span>
                <span className="ml-3 text-xs text-muted">{o.createdAt.toLocaleDateString()}</span>
              </span>
              <span className="flex items-center gap-4">
                <span className="rounded-full bg-white/5 px-3 py-1 font-tag text-[0.6rem] ring-1 ring-white/10">{STATUS[o.status] ?? o.status}</span>
                <span className="font-display text-2xl font-black">{money(o.total)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <h2 className="font-display mt-12 flex items-center gap-2 text-4xl font-black"><FolderHeart className="text-red" /> Projects</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="panel press flex items-center justify-between p-4">
            <span className="font-semibold">{p.name}</span>
            <span className="text-xs text-muted">{p._count.designs} designs</span>
          </Link>
        ))}
        <Link href="/build" className="press flex items-center justify-center rounded-[1.25rem] border border-dashed border-white/15 p-4 text-sm text-muted hover:text-red">+ New design</Link>
      </div>
    </div>
  );
}
