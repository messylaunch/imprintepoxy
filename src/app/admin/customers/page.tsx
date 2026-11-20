import Link from "next/link";
import { Phone, Search } from "lucide-react";
import { db } from "@/lib/db";
import { US_STATES } from "@/lib/site";
import { ago, Avatar, SourceBadge } from "../ui";

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; state?: string; source?: string }> }) {
  const { q = "", state = "", source = "" } = await searchParams;
  const users = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(state ? { state } : {}),
      ...(source ? { source } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { city: { contains: q } }] } : {}),
    },
    orderBy: { lastSeenAt: "desc" },
    include: { _count: { select: { projects: true, orders: true } }, conversations: { where: { staffUnread: true }, select: { id: true } } },
  });
  const states = await db.user.groupBy({ by: ["state"], where: { role: "CUSTOMER", state: { not: null } }, _count: true });

  return (
    <div>
      <form className="flex flex-wrap gap-2">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} className="input pl-10" placeholder="Search name, email, phone, city…" />
        </div>
        <select name="state" defaultValue={state} className="input w-32">
          <option value="">All states</option>
          {US_STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="source" defaultValue={source} className="input w-36">
          <option value="">All sources</option>
          <option value="signup">Accounts</option>
          <option value="chat">Chat leads</option>
          <option value="request">Requests</option>
          <option value="checkout">Buyers</option>
        </select>
        <button className="btn">Filter</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {states.sort((a, b) => b._count - a._count).map((s) => (
          <Link key={s.state} href={`?state=${s.state}`} className={`rounded-full px-3 py-1 text-xs ring-1 ${state === s.state ? "bg-red ring-red" : "ring-white/10 hover:ring-white/30"}`}>
            {s.state} · {s._count}
          </Link>
        ))}
        {(state || q || source) && <Link href="/admin/customers" className="px-2 py-1 text-xs text-muted hover:text-fg">Clear</Link>}
      </div>

      <div className="panel mt-5 overflow-hidden">
        <div className="hidden grid-cols-[2fr_1.3fr_0.7fr_0.8fr_0.6fr_0.6fr_0.6fr] gap-3 border-b border-line px-4 py-2.5 font-tag text-[0.58rem] text-muted md:grid">
          <span>Customer</span><span>Phone</span><span>State</span><span>Source</span><span>Projects</span><span>Orders</span><span>Seen</span>
        </div>
        {users.length === 0 && <p className="p-6 text-sm text-muted">Nobody matches that filter.</p>}
        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-white/[0.03] md:grid-cols-[2fr_1.3fr_0.7fr_0.8fr_0.6fr_0.6fr_0.6fr]">
            <Link href={`/admin/customers/${u.id}`} className="flex min-w-0 items-center gap-3">
              <Avatar name={u.name} />
              <span className="min-w-0">
                <span className="flex items-center gap-2 truncate text-sm font-semibold">
                  {u.name}
                  {u.conversations.length > 0 && <span className="h-2 w-2 rounded-full bg-red shadow-[0_0_8px_#ff1f1f]" title="Unread message" />}
                </span>
                <span className="block truncate text-xs text-muted">{u.email}</span>
              </span>
            </Link>
            {u.phone ? (
              <a href={`tel:${u.phone}`} className="flex items-center gap-1.5 justify-self-end text-sm hover:text-red md:justify-self-start">
                <Phone size={13} className="text-red" /> <span className="hidden md:inline">{u.phone}</span>
              </a>
            ) : <span className="hidden text-xs text-muted md:block">—</span>}
            <span className="hidden text-sm md:block">{u.state ?? "—"}</span>
            <span className="hidden md:block"><SourceBadge s={u.source} /></span>
            <span className="hidden text-sm md:block">{u._count.projects}</span>
            <span className="hidden text-sm md:block">{u._count.orders}</span>
            <span className="hidden text-xs text-muted md:block">{ago(u.lastSeenAt)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">{users.length} shown. Hooking up GoHighLevel later? This list maps 1:1 to contacts.</p>
    </div>
  );
}
