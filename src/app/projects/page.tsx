import Link from "next/link";
import { FolderHeart, Play, Plus } from "lucide-react";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { money, parseConfig } from "@/lib/design";
import { Thumb } from "@/components/thumb";
import { AuthForm } from "@/components/auth-sheet";
import { NewProjectButton } from "@/components/project-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Projects" };

export default async function Projects() {
  const user = await getUser();
  if (!user)
    return (
      <div className="mx-auto grid max-w-5xl gap-10 px-4 pt-28 md:grid-cols-2 md:px-6">
        <div>
          <p className="font-tag text-xs text-red">My projects</p>
          <h1 className="font-display mt-2 text-6xl font-black md:text-7xl">
            <span className="chrome-text">Your ideas, saved.</span>
          </h1>
          <p className="mt-4 text-muted">Group designs into projects, like “Football Team” or “Family Table”, compare them side by side, swipe through them in display mode, and share with family before you buy.</p>
        </div>
        <div className="panel p-6">
          <AuthForm />
        </div>
      </div>
    );

  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { designs: { orderBy: { updatedAt: "desc" }, select: { id: true, thumbnail: true, price: true, liked: true, config: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-tag text-xs text-red">My projects</p>
          <h1 className="font-display mt-2 text-6xl font-black md:text-8xl">
            <span className="chrome-text">Your ideas</span>
          </h1>
        </div>
        <NewProjectButton />
      </div>
      {projects.length === 0 ? (
        <div className="panel mt-10 p-10 text-center">
          <FolderHeart className="mx-auto text-red" size={40} />
          <h2 className="font-display mt-4 text-4xl font-black">No projects yet</h2>
          <p className="mt-2 text-sm text-muted">Build a design and save it. It'll land here.</p>
          <Link href="/build" className="btn mt-6">
            <Plus size={16} /> Start building
          </Link>
        </div>
      ) : (
        <div className="stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-[1.6rem] bg-ink-2 ring-1 ring-line">
              <Link href={`/projects/${p.id}`} className="block">
                <div className="grid aspect-[16/10] grid-cols-2 grid-rows-2 gap-px bg-line">
                  {[0, 1, 2, 3].map((i) => {
                    const d = p.designs[i];
                    return (
                      <div key={i} className="overflow-hidden bg-ink-3">
                        <Thumb src={d?.thumbnail} config={d ? parseConfig(d.config) : null} />
                      </div>
                    );
                  })}
                </div>
                <div className="p-4">
                  <h2 className="font-display text-3xl font-extrabold leading-none">{p.name}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {p.designs.length} design{p.designs.length === 1 ? "" : "s"}
                    {p.designs.length > 0 && ` · from ${money(Math.min(...p.designs.map((d) => d.price)))}`}
                    {p.designs.some((d) => d.liked) && " · ♥ favorite picked"}
                  </p>
                </div>
              </Link>
              {p.designs.length > 0 && (
                <Link href={`/projects/${p.id}/show`} className="btn btn-sm absolute right-3 top-3">
                  <Play size={12} /> Show
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
