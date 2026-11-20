import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseConfig } from "@/lib/design";
import { ProjectView } from "@/components/project-view";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/projects");
  const { id } = await params;
  const p = await db.project.findFirst({ where: { id, userId: user.id }, include: { designs: { orderBy: { createdAt: "asc" } } } });
  if (!p) notFound();
  return (
    <ProjectView
      project={{ id: p.id, name: p.name }}
      designs={p.designs.map((d) => ({ id: d.id, name: d.name, price: d.price, liked: d.liked, thumbnail: d.thumbnail, config: parseConfig(d.config) }))}
    />
  );
}
