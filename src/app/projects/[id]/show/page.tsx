import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseConfig } from "@/lib/design";
import { DisplayMode } from "@/components/display-mode";

export const dynamic = "force-dynamic";

export default async function Show({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ i?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/projects");
  const { id } = await params;
  const { i } = await searchParams;
  const p = await db.project.findFirst({ where: { id, userId: user.id }, include: { designs: { orderBy: { createdAt: "asc" } } } });
  if (!p || !p.designs.length) notFound();
  return (
    <DisplayMode
      project={{ id: p.id, name: p.name }}
      start={Math.max(0, Math.min(p.designs.length - 1, Number(i) || 0))}
      designs={p.designs.map((d) => ({ id: d.id, name: d.name, price: d.price, liked: d.liked, config: parseConfig(d.config) }))}
    />
  );
}
