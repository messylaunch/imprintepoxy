"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Pencil, Play, Plus, ShoppingBag, Trash2, Check } from "lucide-react";
import { api, useCart, useToast } from "./providers";
import { openChat } from "./chat-bubble";
import { Thumb } from "./thumb";
import { DesignConfig, PRODUCTS, ProductType, describe, money } from "@/lib/design";

type D = { id: string; name: string; price: number; liked: boolean; thumbnail: string | null; config: DesignConfig };

export function ProjectView({ project, designs: initial }: { project: { id: string; name: string }; designs: D[] }) {
  const router = useRouter();
  const cart = useCart();
  const toast = useToast();
  const [designs, setDesigns] = useState(initial);
  const [name, setName] = useState(project.name);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  async function rename() {
    setEditing(false);
    if (name.trim() && name !== project.name) await api(`/api/projects/${project.id}`, { name }, "PATCH");
  }
  async function like(d: D) {
    setDesigns((ds) => ds.map((x) => (x.id === d.id ? { ...x, liked: !x.liked } : x)));
    await api(`/api/designs/${d.id}`, { liked: !d.liked }, "PATCH").catch(() => {});
  }
  async function remove(d: D) {
    if (!confirm(`Delete “${d.name}”?`)) return;
    setDesigns((ds) => ds.filter((x) => x.id !== d.id));
    await api(`/api/designs/${d.id}`, undefined, "DELETE");
    router.refresh();
  }
  async function delProject() {
    if (!confirm(`Delete the whole “${name}” project and its designs?`)) return;
    await api(`/api/projects/${project.id}`, undefined, "DELETE");
    router.push("/projects");
    router.refresh();
  }
  function addToCart(d: D) {
    cart.add({ kind: "design", designId: d.id, title: d.name, price: d.price, thumb: d.thumbnail ?? "", config: d.config, details: describe(d.config) });
    toast(`${d.name} added`, { label: "Checkout", href: "/checkout" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
      <Link href="/projects" className="font-tag mb-4 inline-flex items-center gap-2 text-xs text-muted hover:text-fg">
        <ArrowLeft size={14} /> All projects
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-tag text-xs text-red">Project · {designs.length} design{designs.length === 1 ? "" : "s"}</p>
          {editing ? (
            <input autoFocus className="font-display mt-2 w-full bg-transparent text-6xl font-black uppercase outline-none md:text-7xl" value={name} onChange={(e) => setName(e.target.value)} onBlur={rename} onKeyDown={(e) => e.key === "Enter" && rename()} />
          ) : (
            <button onClick={() => setEditing(true)} className="group mt-2 flex items-center gap-3 text-left">
              <h1 className="font-display text-6xl font-black md:text-7xl">{name}</h1>
              <Pencil size={18} className="text-muted opacity-0 transition group-hover:opacity-100" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openChat({ projectId: project.id, projectName: name })} className="btn btn-ghost">
            <MessageCircle size={16} /> Ask about this
          </button>
          {designs.length > 0 && (
            <Link href={`/projects/${project.id}/show`} className="btn">
              <Play size={16} /> Display mode
            </Link>
          )}
        </div>
      </div>

      <div className="stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((d, i) => (
          <motion.div layout key={d.id} className="group overflow-hidden rounded-[1.6rem] bg-ink-2 ring-1 ring-line">
            <Link href={`/projects/${project.id}/show?i=${i}`} className="sheen relative block aspect-[5/4] bg-[radial-gradient(80%_70%_at_50%_45%,#23232a,#0c0c0f)]">
              <Thumb src={d.thumbnail} config={d.config} fit="contain" />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-tag text-[0.6rem] backdrop-blur">{PRODUCTS[d.config.product].name}</span>
            </Link>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display truncate text-2xl font-extrabold leading-none">{d.name}</h3>
                  <p className="mt-1 truncate text-xs text-muted">{describe(d.config).slice(0, 3).join(" · ")}</p>
                </div>
                <button onClick={() => like(d)} className="press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5" aria-label="Favorite">
                  <Heart size={18} className={d.liked ? "fill-red text-red" : "text-muted"} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-display mr-auto text-2xl font-black">{money(d.price)}</span>
                <button onClick={() => remove(d)} className="press grid h-9 w-9 place-items-center rounded-full text-muted hover:text-red" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
                <Link href={`/build/${d.config.product}?design=${d.id}`} className="btn btn-ghost btn-sm">
                  <Pencil size={13} /> Edit
                </Link>
                <button onClick={() => addToCart(d)} className="btn btn-sm">
                  <ShoppingBag size={13} /> Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="relative">
          <button onClick={() => setAdding((a) => !a)} className="press grid h-full min-h-64 w-full place-items-center rounded-[1.6rem] border border-dashed border-white/15 text-muted hover:border-red hover:text-red">
            <span className="text-center">
              <Plus className="mx-auto" size={32} />
              <span className="font-tag mt-2 block text-xs">Add a design</span>
            </span>
          </button>
          <AnimatePresence>
            {adding && (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }} className="absolute inset-0 grid gap-2 rounded-[1.6rem] bg-ink-3 p-4 ring-1 ring-red/40">
                {(Object.keys(PRODUCTS) as ProductType[]).map((t) => (
                  <Link key={t} href={`/build/${t}?project=${project.id}`} className="press flex items-center justify-between rounded-2xl bg-white/5 px-4 text-left ring-1 ring-white/10 hover:bg-white/10">
                    <span className="font-display text-2xl font-extrabold">{PRODUCTS[t].name}</span>
                    <span className="text-xs text-muted">from {money(PRODUCTS[t].sizes[0].price)}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button onClick={delProject} className="font-tag mt-12 text-xs text-muted hover:text-red">
        Delete project
      </button>
    </div>
  );
}

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const r = await api<{ project: { id: string } }>("/api/projects", { name });
    router.push(`/projects/${r.project.id}`);
  }
  return open ? (
    <form onSubmit={create} className="flex gap-2">
      <input autoFocus className="input w-56" placeholder="e.g. Baseball Team" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="btn">
        <Check size={16} />
      </button>
    </form>
  ) : (
    <button onClick={() => setOpen(true)} className="btn btn-ghost">
      <Plus size={16} /> New project
    </button>
  );
}
