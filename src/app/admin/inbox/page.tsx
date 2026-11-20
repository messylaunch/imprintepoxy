import Link from "next/link";
import { db } from "@/lib/db";
import { ago, Avatar } from "../ui";
import { StaffThread } from "./thread";
import { Thumb } from "@/components/thumb";
import { parseConfig } from "@/lib/design";

export default async function Inbox({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const convs = await db.conversation.findMany({ orderBy: [{ lastMessageAt: "desc" }], take: 100, include: { user: true, project: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } } });
  const sel = c ? await db.conversation.findUnique({ where: { id: c }, include: { user: true, project: { include: { designs: { take: 6, select: { id: true, thumbnail: true, name: true, config: true } } } }, messages: { orderBy: { createdAt: "asc" } } } }) : null;
  return (
    <div className="grid gap-4 md:grid-cols-[340px_1fr]">
      <div className={`panel overflow-hidden ${sel ? "hidden md:block" : ""}`}>
        {convs.length === 0 && <p className="p-6 text-sm text-muted">No conversations yet. When someone uses the chat bubble, it lands here.</p>}
        {convs.map((x) => (
          <Link key={x.id} href={`/admin/inbox?c=${x.id}`} className={`flex items-center gap-3 border-b border-line p-3 last:border-0 ${x.id === c ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}>
            <Avatar name={x.user.name} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className="truncate">{x.user.name}</span>
                {x.staffUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-red" />}
              </span>
              <span className="block truncate text-[11px] text-red/90">{x.project ? `Project: ${x.project.name}` : x.topic === "custom" ? "Special request" : "General question"}</span>
              <span className="block truncate text-xs text-muted">{x.messages[0]?.body}</span>
            </span>
            <span className="text-[11px] text-muted">{ago(x.lastMessageAt)}</span>
          </Link>
        ))}
      </div>
      {sel ? (
        <div className="panel flex h-[70svh] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line p-3">
            <Link href="/admin/inbox" className="font-tag text-xs text-muted md:hidden">←</Link>
            <Avatar name={sel.user.name} />
            <div className="min-w-0 flex-1">
              <Link href={`/admin/customers/${sel.userId}`} className="block truncate text-sm font-semibold hover:text-red">{sel.user.name}</Link>
              <p className="truncate text-xs text-muted">{sel.user.email}{sel.user.phone && ` · ${sel.user.phone}`}{sel.user.state && ` · ${sel.user.state}`}</p>
            </div>
            {sel.user.phone && <a href={`tel:${sel.user.phone}`} className="btn btn-sm">Call</a>}
          </div>
          {sel.project && (
            <div className="flex items-center gap-2 border-b border-line bg-white/[0.02] px-3 py-2">
              <span className="font-tag text-[0.58rem] text-muted">{sel.project.name}</span>
              <div className="flex gap-1.5">
                {sel.project.designs.map((d) => (
                  <div key={d.id} title={d.name} className="h-9 w-11 overflow-hidden rounded-md bg-ink-3"><Thumb src={d.thumbnail} config={parseConfig(d.config)} /></div>
                ))}
              </div>
            </div>
          )}
          <StaffThread id={sel.id} initial={sel.messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
        </div>
      ) : (
        <div className="panel hidden place-items-center p-10 text-sm text-muted md:grid">Pick a conversation</div>
      )}
    </div>
  );
}
