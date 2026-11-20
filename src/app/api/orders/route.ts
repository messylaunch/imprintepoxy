import { db } from "@/lib/db";
import { getUser, startSession } from "@/lib/auth";
import { clean, emailOk, fail, ok } from "@/lib/http";
import { findShop } from "@/lib/catalog";
import { DesignConfig, describe, priceOf } from "@/lib/design";
import { quote } from "@/lib/pricing";

// PRACTICE CHECKOUT. No money moves. Swap this for Stripe Checkout / PaymentIntents later.
type Line = { kind: "shop" | "design"; slug?: string; designId?: string; config?: DesignConfig; title: string; qty: number; thumb?: string };

function luhn(n: string) {
  let s = 0, dbl = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = +n[i];
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    s += d;
    dbl = !dbl;
  }
  return s % 10 === 0;
}

export async function POST(req: Request) {
  const b = await req.json();
  const lines: Line[] = Array.isArray(b.lines) ? b.lines.slice(0, 30) : [];
  if (!lines.length) return fail("Your cart is empty");

  const contact = { name: clean(b.contact?.name, 80), email: clean(b.contact?.email).toLowerCase(), phone: clean(b.contact?.phone, 30) };
  const ship = { method: b.ship?.method === "ship" ? "ship" : "pickup", address: clean(b.ship?.address), city: clean(b.ship?.city, 60), state: clean(b.ship?.state, 2), zip: clean(b.ship?.zip, 10) };
  if (!contact.name) return fail("Add your name");
  if (!emailOk(contact.email)) return fail("Add a valid email");
  if (ship.method === "ship" && (!ship.address || !ship.city || !ship.state || !ship.zip)) return fail("Add your shipping address");

  const num = String(b.card?.number ?? "").replace(/\D/g, "");
  const [mm, yy] = String(b.card?.exp ?? "").split("/").map((x: string) => parseInt(x, 10));
  if (num.length < 13 || !luhn(num)) return fail("Card number isn't valid");
  if (!mm || !yy || mm > 12 || new Date(2000 + yy, mm) < new Date()) return fail("Card is expired");
  if (!/^\d{3,4}$/.test(String(b.card?.cvc ?? ""))) return fail("Check the CVC");
  if (num === "4000000000000002") return fail("Card declined (practice decline card)", 402);

  // re-price everything on the server
  const items = [];
  for (const l of lines) {
    const qty = Math.max(1, Math.min(9, Number(l.qty) || 1));
    if (l.kind === "shop") {
      const s = l.slug ? findShop(l.slug) : null;
      if (!s || s.status === "sold") return fail(`${l.title} is no longer available`);
      items.push({ kind: "shop", slug: s.slug, title: s.title, qty, price: s.price, thumb: s.image, details: [s.size] });
    } else {
      if (!l.config || !["table", "helmet", "wall"].includes(l.config.product)) return fail("A design in your cart is broken");
      l.config.effects = Array.isArray(l.config.effects) ? l.config.effects.slice(0, 1) : [];
      items.push({ kind: "design", designId: l.designId ?? null, title: clean(l.title, 80) || "Custom design", qty, price: priceOf(l.config), thumb: l.thumb?.startsWith("data:image") && l.thumb.length < 400_000 ? l.thumb : null, config: l.config, details: describe(l.config) });
    }
  }
  const totals = quote(items, ship.method as "ship" | "pickup");

  // who is buying
  let user = await getUser();
  let newSession = false;
  if (!user) {
    user = await db.user.findUnique({ where: { email: contact.email } });
    if (!user) {
      user = await db.user.create({ data: { name: contact.name, email: contact.email, phone: contact.phone || null, state: ship.state || null, city: ship.city || null, source: "checkout" } });
      newSession = true;
    }
  } else if (!user.phone && contact.phone) {
    await db.user.update({ where: { id: user.id }, data: { phone: contact.phone } });
  }

  const last = await db.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
  const number = (last?.number ?? 1000) + 1;

  // make sure every custom design lives in a project the owner can open
  const unsaved = items.filter((i) => i.kind === "design" && !i.designId);
  if (unsaved.length) {
    const p = await db.project.create({ data: { userId: user.id, name: `Order #${number}` } });
    for (const i of unsaved) {
      const d = await db.design.create({ data: { projectId: p.id, name: i.title, product: i.config!.product, config: JSON.stringify(i.config), thumbnail: i.thumb, price: i.price } });
      i.designId = d.id;
    }
  }

  const order = await db.order.create({
    data: {
      number,
      userId: user.id,
      items: JSON.stringify(items),
      ...totals,
      shipName: contact.name,
      address: ship.method === "ship" ? ship.address : "Local pickup",
      city: ship.city,
      state: ship.state,
      zip: ship.zip,
      cardLast4: num.slice(-4),
    },
  });
  if (newSession) await startSession(user.id);
  return ok({ order: { id: order.id, number } });
}
