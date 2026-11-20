import { notFound } from "next/navigation";
import { Builder } from "@/components/builder";
import { CustomRequest } from "@/components/custom-request";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { findConcept, findShop } from "@/lib/catalog";
import { DesignConfig, ProductType, defaultConfig, parseConfig } from "@/lib/design";

export const dynamic = "force-dynamic";

export default async function BuildPage({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { type } = await params;
  const sp = await searchParams;
  const user = await getUser();

  const projects = user
    ? (await db.project.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { designs: true } } } })).map((p) => ({ id: p.id, name: p.name, count: p._count.designs }))
    : [];

  if (type === "custom") return <CustomRequest projects={projects} />;
  if (!["table", "helmet", "wall"].includes(type)) notFound();
  const product = type as ProductType;

  let initial: DesignConfig = defaultConfig(product);
  let design: { id: string; name: string; projectId: string } | null = null;
  let fromPreset = false;

  if (sp.design && user) {
    const d = await db.design.findFirst({ where: { id: sp.design, project: { userId: user.id } } });
    if (d) {
      initial = parseConfig(d.config);
      design = { id: d.id, name: d.name, projectId: d.projectId };
    }
  } else if (sp.from) {
    const s = findShop(sp.from);
    if (s) {
      initial = { ...initial, ...s.preset, product };
      fromPreset = true;
    }
  } else if (sp.idea) {
    const c = findConcept(sp.idea);
    if (c) {
      initial = { ...c.config };
      fromPreset = true;
    }
  }

  return <Builder key={design?.id ?? sp.from ?? sp.idea ?? product} product={product} initial={initial} design={design} fromPreset={fromPreset} projects={projects} defaultProjectId={sp.project ?? null} />;
}
