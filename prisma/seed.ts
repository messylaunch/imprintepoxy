import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultConfig, priceOf, DesignConfig, ProductType } from "../src/lib/design";

const db = new PrismaClient();
const cfg = (p: ProductType, o: Partial<DesignConfig>): DesignConfig => ({ ...defaultConfig(p), ...o });

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL ?? "owner@imprintepoxy.test";
  const ownerPass = process.env.OWNER_PASSWORD ?? "imprint2026";
  await db.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: { email: ownerEmail, name: "Imprint Owner", role: "OWNER", source: "seed", passwordHash: await bcrypt.hash(ownerPass, 10), state: "TN" },
  });
  if ((await db.user.count({ where: { role: "CUSTOMER" } })) > 0) return console.log("Already seeded.");

  const pw = await bcrypt.hash("demo1234", 10);
  const day = (n: number) => new Date(Date.now() - n * 864e5);

  const marcus = await db.user.create({ data: { name: "Marcus Bell", email: "marcus@example.com", phone: "(615) 555-0142", city: "Nashville", state: "TN", passwordHash: pw, source: "signup", createdAt: day(3), lastSeenAt: day(0.1) } });
  const tasha = await db.user.create({ data: { name: "Tasha Greene", email: "tasha@example.com", phone: "(901) 555-0177", city: "Memphis", state: "TN", source: "chat", createdAt: day(1), lastSeenAt: day(1) } });
  const dre = await db.user.create({ data: { name: "Andre Williams", email: "dre@example.com", phone: "(407) 555-0110", city: "Orlando", state: "FL", passwordHash: pw, source: "signup", createdAt: day(6), lastSeenAt: day(2) } });
  await db.user.create({ data: { name: "Keisha Moore", email: "keisha@example.com", phone: "(404) 555-0193", city: "Atlanta", state: "GA", source: "request", createdAt: day(0.5), lastSeenAt: day(0.5) } });
  await db.user.create({ data: { name: "Coach Ray Dixon", email: "coachray@example.com", phone: "(423) 555-0168", city: "Chattanooga", state: "TN", passwordHash: pw, source: "signup", createdAt: day(9), lastSeenAt: day(4) } });

  const mk = async (userId: string, name: string, designs: [string, DesignConfig, boolean?][], ago = 0) => {
    const p = await db.project.create({ data: { userId, name, updatedAt: day(ago) } });
    for (const [n, c, liked] of designs) await db.design.create({ data: { projectId: p.id, name: n, product: c.product, config: JSON.stringify(c), price: priceOf(c), liked: !!liked } });
    return p;
  };

  const football = await mk(marcus.id, "Football Team", [
    ["Rivalry coffee table", cfg("table", { size: "coffee", imageUrl: "/media/florida-classic.jpg", flake: "silver", effects: ["sparkle"] }), true],
    ["Wildcats helmet L", cfg("helmet", { size: "l", imageUrl: "/media/bcu-helmet-panel.jpg", frame: "gold", transform: { x: -0.08, y: 0, scale: 1.25, rotation: 0 } })],
    ["Team wall panel", cfg("wall", { size: "24x36", imageUrl: "/media/bcu-helmet-panel.jpg", flake: "gold", effects: ["neon"] })],
  ], 0.1);
  await mk(marcus.id, "Baseball Team", [
    ["Dugout end table", cfg("table", { size: "end", imageUrl: "/media/florida-classic.jpg", filter: "vintage", effects: ["vignette"] })],
    ["Locker room panel", cfg("wall", { size: "18x24", imageUrl: "/media/florida-classic.jpg", filter: "punch", flake: "red" })],
  ], 1);
  await mk(marcus.id, "Family Picture", [
    ["Gold family table", cfg("table", { size: "round", imageUrl: "/media/ponds-top.jpg", flake: "gold", effects: ["goldflake"], frame: "gold" }), true],
    ["Grandma's wall piece", cfg("wall", { size: "18x24", orientation: "portrait", imageUrl: "/media/ponds-top.jpg", effects: ["holo"] })],
  ], 2);
  const dreProj = await mk(dre.id, "Classic Weekend", [["Star helmet", cfg("helmet", { size: "m", imageUrl: "/media/cowboys-helmet.jpg", flake: "silver", frame: "black", transform: { x: 0.02, y: 0.02, scale: 1.12, rotation: 0 } })]], 2);

  const conv = await db.conversation.create({ data: { userId: marcus.id, projectId: football.id, topic: "project", staffUnread: true, lastMessageAt: day(0.05) } });
  await db.message.createMany({ data: [
    { conversationId: conv.id, authorName: "Marcus Bell", body: "Can the coffee table have the team colors on the edge instead of black?", createdAt: day(0.2) },
    { conversationId: conv.id, authorName: "Imprint", fromStaff: true, body: "For sure. We can do a candy red or gold edge. Want me to mock both?", createdAt: day(0.15) },
    { conversationId: conv.id, authorName: "Marcus Bell", body: "Yes please! Also need it before the 12th if possible.", createdAt: day(0.05) },
  ] });
  const c2 = await db.conversation.create({ data: { userId: tasha.id, topic: "general", staffUnread: true, lastMessageAt: day(1) } });
  await db.message.create({ data: { conversationId: c2.id, authorName: "Tasha Greene", body: "Hi! Do you do bar tops? Ours is about 8 feet long.", createdAt: day(1) } });

  const items = [{ kind: "design", designId: null, title: "Star helmet", qty: 1, price: 24500, thumb: null, config: JSON.parse((await db.design.findFirst({ where: { projectId: dreProj.id } }))!.config), details: ["Medium · 24\" wide", "Mirror Gloss", "Silver flake"] }];
  await db.order.create({ data: { number: 1001, userId: dre.id, items: JSON.stringify(items), subtotal: 24500, shipping: 2500, tax: 2266, total: 29266, status: "IN_PRODUCTION", shipName: "Andre Williams", address: "123 Demo St", city: "Orlando", state: "FL", zip: "32801", cardLast4: "4242", createdAt: day(2) } });

  console.log(`Seeded. Owner login: ${ownerEmail} / ${ownerPass}`);
}
main().finally(() => db.$disconnect());
