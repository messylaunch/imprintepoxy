import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/design";
import { StatusSelect } from "./status";

type Item = { kind: string; title: string; qty: number; price: number; thumb?: string | null; details?: string[]; config?: { imageUrl?: string | null } };

export default async function Orders() {
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } });
  if (!orders.length) return <div className="panel p-10 text-center text-sm text-muted">No orders yet. Run a practice checkout to see one here.</div>;
  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const items = JSON.parse(o.items) as Item[];
        return (
          <div key={o.id} id={o.id} className="panel scroll-mt-24 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-2xl">#{o.number}</span>
              <Link href={`/admin/customers/${o.userId}`} className="text-sm font-semibold hover:text-red">{o.user.name}</Link>
              <span className="text-xs text-muted">{o.createdAt.toLocaleString()}</span>
              <span className="ml-auto font-display text-xl">{money(o.total)}</span>
              <StatusSelect id={o.id} status={o.status} />
            </div>
            <p className="mt-1 text-xs text-muted">{o.address === "Local pickup" ? "Local pickup" : `${o.shipName}, ${o.address}, ${o.city}, ${o.state} ${o.zip}`} · card •••• {o.cardLast4} (practice)</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {items.map((i, k) => (
                <div key={k} className="flex gap-3 rounded-xl bg-white/[0.03] p-2">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-3">{i.thumb && <img src={i.thumb} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.title} {i.qty > 1 && `×${i.qty}`}</p>
                    <p className="line-clamp-2 text-[11px] text-muted">{i.details?.join(" · ")}</p>
                    {i.config?.imageUrl && <a href={i.config.imageUrl} target="_blank" className="font-tag text-[0.55rem] text-red">Download original art ↗</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
