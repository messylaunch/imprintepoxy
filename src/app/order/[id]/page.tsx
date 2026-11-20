import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { db } from "@/lib/db";
import { getSession, isStaff } from "@/lib/auth";
import { money } from "@/lib/design";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession();
  const o = await db.order.findUnique({ where: { id } });
  if (!o || !s || (o.userId !== s.user.id && !isStaff(s.realUser))) notFound();
  const items = JSON.parse(o.items) as { title: string; qty: number; price: number; thumb?: string | null; details?: string[] }[];
  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full" style={{ background: "var(--candy)" }}>
        <Check size={36} />
      </div>
      <p className="mt-6 text-sm text-muted">Order #{o.number}</p>
      <h1 className="font-display mt-2 text-5xl md:text-6xl"><span className="chrome-text">It's official.</span></h1>
      <p className="mx-auto mt-3 max-w-md text-muted">We got it. Custom pieces usually take 2–3 weeks to pour and cure. We'll text and email updates along the way.</p>
      <div className="panel mt-8 p-5 text-left">
        {items.map((i, k) => (
          <div key={k} className="flex items-center gap-3 py-2">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-3">{i.thumb && <img src={i.thumb} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{i.title} {i.qty > 1 && `×${i.qty}`}</p>
              <p className="truncate text-xs text-muted">{i.details?.slice(0, 3).join(" · ")}</p>
            </div>
            <span className="text-sm">{money(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-line pt-3">
          <span className="text-muted">Paid (practice) · card •••• {o.cardLast4}</span>
          <span className="font-display text-2xl">{money(o.total)}</span>
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account" className="btn btn-ghost">My account</Link>
        <Link href="/imprint" className="btn">See who you just supported</Link>
      </div>
      <p className="mt-8 text-sm text-muted">
        Questions about your order? Call or text <a href={site.phoneHref} className="text-fg hover:underline">{site.phone}</a> or email{" "}
        <a href={site.emailHref} className="text-fg hover:underline">{site.email}</a>.
      </p>
    </div>
  );
}
