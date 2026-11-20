import Link from "next/link";
import { db } from "@/lib/db";
import { money, parseConfig } from "@/lib/design";
import { Thumb } from "@/components/thumb";
import { ago, Avatar, SourceBadge } from "./ui";

export default async function Dashboard() {
  const week = new Date(Date.now() - 7 * 864e5);
  const [customers, newLeads, unread, orders, revenue, recentUsers, convs, recentOrders, activeProjects] = await Promise.all([
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: week } } }),
    db.conversation.count({ where: { staffUnread: true, status: "OPEN" } }),
    db.order.count(),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.user.findMany({ where: { role: "CUSTOMER" }, orderBy: { createdAt: "desc" }, take: 6, include: { _count: { select: { projects: true } } } }),
    db.conversation.findMany({ where: { status: "OPEN" }, orderBy: { lastMessageAt: "desc" }, take: 6, include: { user: true, project: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: true } }),
    db.project.findMany({ orderBy: { updatedAt: "desc" }, take: 6, include: { user: true, designs: { take: 3, orderBy: { updatedAt: "desc" }, select: { thumbnail: true, config: true } } } }),
  ]);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Customers & leads" value={customers} sub={`+${newLeads} this week`} href="/admin/customers" />
        <Stat label="Unread messages" value={unread} sub="Waiting on you" href="/admin/inbox" hot={unread > 0} />
        <Stat label="Orders" value={orders} href="/admin/orders" />
        <Stat label="Revenue (practice)" value={money(revenue._sum.total ?? 0)} href="/admin/orders" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Inbox" href="/admin/inbox">
          {convs.length === 0 && <Empty>No open conversations</Empty>}
          {convs.map((c) => (
            <Link key={c.id} href={`/admin/inbox?c=${c.id}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${c.staffUnread ? "bg-red shadow-[0_0_8px_#ff1f1f]" : "bg-white/15"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{c.user.name} <span className="font-normal text-muted">· {c.project?.name ?? (c.topic === "custom" ? "Special request" : "General")}</span></span>
                <span className="block truncate text-xs text-muted">{c.messages[0]?.body}</span>
              </span>
              <span className="text-[11px] text-muted">{ago(c.lastMessageAt)}</span>
            </Link>
          ))}
        </Card>
        <Card title="Newest leads" href="/admin/customers">
          {recentUsers.map((u) => (
            <Link key={u.id} href={`/admin/customers/${u.id}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5">
              <Avatar name={u.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{u.name}</span>
                <span className="block truncate text-xs text-muted">{[u.city, u.state].filter(Boolean).join(", ") || u.email} · {u._count.projects} projects</span>
              </span>
              <SourceBadge s={u.source} />
            </Link>
          ))}
        </Card>
        <Card title="Projects in progress" href="/admin/customers">
          {activeProjects.map((p) => (
            <Link key={p.id} href={`/admin/customers/${p.userId}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5">
              <div className="flex -space-x-3">
                {p.designs.map((d, i) => (
                  <div key={i} className="h-10 w-10 overflow-hidden rounded-lg bg-ink-3 ring-2 ring-ink-2"><Thumb src={d.thumbnail} config={parseConfig(d.config)} /></div>
                ))}
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{p.name}</span>
                <span className="block truncate text-xs text-muted">{p.user.name}</span>
              </span>
              <span className="text-[11px] text-muted">{ago(p.updatedAt)}</span>
            </Link>
          ))}
        </Card>
        <Card title="Recent orders" href="/admin/orders">
          {recentOrders.length === 0 && <Empty>No orders yet</Empty>}
          {recentOrders.map((o) => (
            <Link key={o.id} href={`/admin/orders#${o.id}`} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5">
              <span className="font-semibold">#{o.number}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">{o.user.name}</span>
              <span className="font-tag rounded-full bg-white/5 px-2 py-0.5 text-[0.55rem]">{o.status.replace("_", " ")}</span>
              <span className="text-sm font-semibold">{money(o.total)}</span>
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, href, hot }: { label: string; value: string | number; sub?: string; href: string; hot?: boolean }) {
  return (
    <Link href={href} className={`panel press p-4 ${hot ? "ring-1 ring-red/60 shadow-[0_0_30px_-10px_#ff1f1f]" : ""}`}>
      <p className="font-tag text-[0.6rem] text-muted">{label}</p>
      <p className="font-display mt-2 text-4xl font-black">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </Link>
  );
}
function Card({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="font-display text-2xl font-black">{title}</h2>
        <Link href={href} className="font-tag text-[0.6rem] text-muted hover:text-red">All →</Link>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
const Empty = ({ children }: { children: React.ReactNode }) => <p className="p-3 text-sm text-muted">{children}</p>;
