"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Loader2, Lock, MapPin, Store, Wand2 } from "lucide-react";
import { api, useCart, useUser } from "@/components/providers";
import { money } from "@/lib/design";
import { quote } from "@/lib/pricing";
import { US_STATES } from "@/lib/site";

export default function Checkout() {
  const cart = useCart();
  const { user, refresh } = useUser();
  const router = useRouter();
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [ship, setShip] = useState({ method: "pickup" as "pickup" | "ship", address: "", city: "", state: "TN", zip: "" });
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) setContact((c) => ({ name: c.name || user.name, email: c.email || user.email, phone: c.phone || user.phone || "" }));
  }, [user]);

  const totals = quote(cart.lines.map((l) => ({ ...l, config: l.config ?? null })), ship.method);

  function testCard() {
    setCard({ number: "4242 4242 4242 4242", exp: "12/30", cvc: "123", name: contact.name || "Test Customer" });
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await api<{ order: { id: string } }>("/api/orders", { lines: cart.lines, contact, ship, card });
      cart.clear();
      refresh();
      router.push(`/order/${r.order.id}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  if (!cart.lines.length)
    return (
      <div className="mx-auto max-w-xl px-4 pt-32 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <Link href="/shop" className="btn mt-6">Go shopping</Link>
      </div>
    );

  return (
    <form onSubmit={pay} className="mx-auto grid max-w-6xl gap-8 px-4 pt-24 md:grid-cols-[1fr_380px] md:px-6">
      <div className="space-y-8">
        <div>
          <p className="text-sm text-muted">Checkout</p>
          <h1 className="font-display mt-2 text-5xl"><span className="chrome-text">Lock it in</span></h1>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gold/10 px-4 py-3 text-xs text-gold ring-1 ring-gold/30">
            <Wand2 size={14} /> Practice mode. No real charge. Use the test card button below.
          </div>
        </div>

        <Section n={1} title="Contact">
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="input" placeholder="Name" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" />
            <input className="input" type="email" placeholder="Email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" />
            <input className="input" type="tel" placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" />
          </div>
        </Section>

        <Section n={2} title="Delivery">
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: "pickup", icon: Store, t: "Local pickup", s: "Free · we'll text you" },
              { id: "ship", icon: MapPin, t: "Ship it", s: "Insured & crated" },
            ] as const).map((o) => (
              <button type="button" key={o.id} data-on={ship.method === o.id} onClick={() => setShip({ ...ship, method: o.id })} className="chip flex items-center gap-3 p-4 text-left">
                <o.icon size={20} className="text-red" />
                <span>
                  <span className="block text-sm font-semibold">{o.t}</span>
                  <span className="block text-xs text-muted">{o.s}</span>
                </span>
              </button>
            ))}
          </div>
          {ship.method === "ship" && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_90px_110px]">
              <input className="input sm:col-span-4" placeholder="Street address" required value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} autoComplete="street-address" />
              <input className="input sm:col-span-2" placeholder="City" required value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} autoComplete="address-level2" />
              <select className="input" value={ship.state} onChange={(e) => setShip({ ...ship, state: e.target.value })}>
                {US_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="ZIP" required value={ship.zip} onChange={(e) => setShip({ ...ship, zip: e.target.value })} autoComplete="postal-code" inputMode="numeric" />
            </motion.div>
          )}
        </Section>

        <Section n={3} title="Payment">
          <div className="relative overflow-hidden rounded-2xl p-5 ring-1 ring-white/10" style={{ background: "linear-gradient(135deg,#1c1c22,#0d0d10)" }}>
            <div className="mb-4 flex items-center justify-between">
              <CreditCard className="text-muted" />
              <button type="button" onClick={testCard} className="btn btn-chrome btn-sm">Use test card</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_100px_90px]">
              <input className="input font-mono tracking-wider" placeholder="Card number" required inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, "").slice(0, 23) })} autoComplete="cc-number" />
              <input className="input" placeholder="MM/YY" required value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })} autoComplete="cc-exp" />
              <input className="input" placeholder="CVC" required inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.slice(0, 4) })} autoComplete="cc-csc" />
            </div>
            <p className="mt-3 text-[11px] text-muted">Try 4000 0000 0000 0002 to see a declined card.</p>
          </div>
        </Section>
      </div>

      <div className="h-fit md:sticky md:top-24">
        <div className="panel p-5">
          <h2 className="font-display text-2xl">Order</h2>
          <div className="mt-4 space-y-3">
            {cart.lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-3">
                  {l.thumb && <img src={l.thumb} alt="" className="h-full w-full object-cover" />}
                  {l.qty > 1 && <span className="absolute right-0.5 top-0.5 rounded-full bg-red px-1.5 text-[10px]">{l.qty}</span>}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm">{l.title}</span>
                <span className="text-sm">{money(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
            <Row k="Subtotal" v={money(totals.subtotal)} />
            <Row k="Shipping" v={totals.shipping ? money(totals.shipping) : "Free"} />
            <Row k="Tax (est.)" v={money(totals.tax)} />
            <div className="flex items-end justify-between pt-2">
              <span className="font-tag text-xs text-muted">Total</span>
              <span className="font-display text-3xl">{money(totals.total)}</span>
            </div>
          </div>
          {err && <p className="mt-3 rounded-xl bg-red/10 px-3 py-2 text-sm text-red ring-1 ring-red/30">{err}</p>}
          <button className="btn mt-5 h-14 w-full" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Pay {money(totals.total)}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted">A portion of every order supports Imprint.</p>
        </div>
      </div>
    </form>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-3 font-display text-2xl">
        <span className="grid h-8 w-8 place-items-center rounded-full text-sm" style={{ background: "var(--candy)" }}>{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between"><span className="text-muted">{k}</span><span>{v}</span></div>
);
