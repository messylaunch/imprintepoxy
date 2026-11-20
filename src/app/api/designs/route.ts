import { db } from "@/lib/db";
import { getUser, touch } from "@/lib/auth";
import { clean, fail, ok } from "@/lib/http";
import { DesignConfig, priceOf } from "@/lib/design";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return fail("Sign in to save", 401);
  const b = await req.json();
  const config = b.config as DesignConfig;
  if (!config || !["table", "helmet", "wall"].includes(config.product)) return fail("Bad design");
  if (config.imageUrl?.startsWith("blob:")) return fail("Image is still uploading");
  config.effects = Array.isArray(config.effects) ? config.effects.slice(0, 1) : []; // one overlay max
  const thumbnail = typeof b.thumbnail === "string" && b.thumbnail.length < 600_000 ? b.thumbnail : null;
  const name = clean(b.name, 80) || "Untitled";

  let projectId: string | null = typeof b.projectId === "string" ? b.projectId : null;
  if (projectId) {
    const p = await db.project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!p) projectId = null;
  }
  if (!projectId) {
    const p = await db.project.create({ data: { userId: user.id, name: clean(b.newProjectName, 60) || "My Project" } });
    projectId = p.id;
  }

  const data = { name, product: config.product, config: JSON.stringify(config), thumbnail, price: priceOf(config), projectId };
  let design;
  if (b.id) {
    const existing = await db.design.findFirst({ where: { id: b.id, project: { userId: user.id } } });
    if (existing) design = await db.design.update({ where: { id: existing.id }, data });
  }
  if (!design) design = await db.design.create({ data });
  await db.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
  await touch(user.id);
  return ok({ design: { id: design.id, projectId } });
}
