import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { money, PRODUCTS, parseConfig } from "@/lib/design";
import { ago, Avatar, SourceBadge } from "../../ui";
import { ViewAsButton, NotesBox } from "./client";
import { StaffThread } from "../../inbox/thread";
import { Thumb } from "@/components/thumb";

export default async function Customer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await db.user.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { updatedAt: "desc" }, include: { designs: { orderBy: { createdAt: "asc" } } } },
      orders: { orderBy: { createdAt: "desc" } },
      conversations: { orderBy: { lastMessageAt: "desc" }, include: { project: true, messages: { orderBy: { createdAt: "asc" } } } },
    },
  });
  if (!u) notFound();
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="panel p-5">
          <div className="flex items-center gap-3">
            <Avatar name={u.name} />
            <div className="min-w-0">
              <h1 className="font-display truncate text-3xl font-black leading-none">{u.name}</h1>
              <p className="mt-1 text-xs text-muted">{[u.city, u.state].filter(Boolean).join(", ") || "Location unknown"} · joined {ago(u.createdAt)} ago</p>
            </div>
          </div>
          <div className="mt-3"><SourceBadge s={u.source} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {u.phone ? <a href={`tel:${u.phone}`} className="btn btn-sm"><Phone size={13} /> Call</a> : <span className="btn btn-ghost btn-sm opacity-40"><Phone size={13} /> Call</span>}
            {u.phone ? <a href={`sms:${u.phone}`} className="btn btn-ghost btn-sm"><MessageSquare size={13} /> Text</a> : <span className="btn btn-ghost btn-sm opacity-40">Text</span>}
            <a href={`mailto:${u.email}`} className="btn btn-ghost btn-sm"><Mail size={13} /> Email</a>
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Email</dt><dd className="truncate">{u.email}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Phone</dt><dd>{u.phone ?? "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Last seen</dt><dd>{ago(u.lastSeenAt)} ago</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Lifetime</dt><dd>{money(u.orders.reduce((a, o) => a + o.total, 0))}</dd></div>
          </dl>
          <ViewAsButton userId={u.id} name={u.name} />
        </div>
        <NotesBox userId={u.id} initial={u.notes ?? ""} />
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-3xl font-black">Projects</h2>
          {u.projects.length === 0 && <p className="mt-2 text-sm text-muted">No projects yet.</p>}
          <div className="mt-3 space-y-4">
            {u.projects.map((p) => (
              <div key={p.id} className="panel p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-extrabold">{p.name}</h3>
                  <span className="text-xs text-muted">updated {ago(p.updatedAt)} ago</span>
                </div>
                <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
                  {p.designs.map((d) => {
                    const c = parseConfig(d.config);
                    return (
                      <div key={d.id} className="w-44 shrink-0">
                        <div className="relative aspect-[5/4] overflow-hidden rounded-xl bg-ink-3">
                          <Thumb src={d.thumbnail} config={c} fit="contain" />
                          {d.liked && <span className="absolute right-1.5 top-1.5 text-red">♥</span>}
                        </div>
                        <p className="mt-1.5 truncate text-sm font-semibold">{d.name}</p>
                        <p className="truncate text-[11px] text-muted">{PRODUCTS[c.product].name} · {money(d.price)}</p>
                        {c.imageUrl && <a href={c.imageUrl} target="_blank" className="font-tag text-[0.55rem] text-red">Original art ↗</a>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-black">Conversations</h2>
          {u.conversations.length === 0 && <p className="mt-2 text-sm text-muted">No messages yet.</p>}
          <div className="mt-3 space-y-4">
            {u.conversations.map((c) => (
              <div key={c.id} className="panel overflow-hidden">
                <div className="border-b border-line px-4 py-2.5 text-sm font-semibold">{c.project?.name ?? (c.topic === "custom" ? "Special request" : "General question")}</div>
                <StaffThread id={c.id} initial={c.messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} compact />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-black">Orders</h2>
          {u.orders.length === 0 && <p className="mt-2 text-sm text-muted">No orders yet.</p>}
          <div className="mt-3 space-y-2">
            {u.orders.map((o) => (
              <Link key={o.id} href={`/admin/orders#${o.id}`} className="panel press flex items-center justify-between p-4">
                <span>#{o.number} <span className="ml-2 text-xs text-muted">{o.createdAt.toLocaleDateString()}</span></span>
                <span className="flex items-center gap-3"><span className="font-tag text-[0.6rem] text-muted">{o.status.replace("_", " ")}</span><b>{money(o.total)}</b></span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
