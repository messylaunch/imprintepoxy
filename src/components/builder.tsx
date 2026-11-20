"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FolderPlus, ImagePlus, Loader2, RotateCcw, RotateCw, ShoppingBag, X, Zap, Crosshair, Move } from "lucide-react";
import { DesignCanvas } from "./design-canvas";
import { AuthSheet } from "./auth-sheet";
import { api, useCart, useToast, useUser } from "./providers";
import { DesignConfig, EFFECTS, FILTERS, FLAKES, FRAMES, PRODUCTS, ProductType, TOPCOATS, describe, money, priceOf } from "@/lib/design";
import { exportDesign } from "@/lib/render";

type Props = {
  product: ProductType;
  initial: DesignConfig;
  fromPreset: boolean;
  design?: { id: string; name: string; projectId: string } | null;
  projects: { id: string; name: string; count: number }[];
  defaultProjectId?: string | null;
};

const STEPS = [
  { id: "pick", label: "Pick it", title: "Size & style" },
  { id: "make", label: "Make it yours", title: "Your image" },
  { id: "seal", label: "Finish it", title: "Finish & overlay" },
  { id: "lock", label: "Lock it in", title: "Review" },
];

const SAMPLES = ["/media/ponds-top.jpg", "/media/florida-classic.jpg", "/media/bcu-helmet-panel.jpg", "/media/cowboys-helmet.jpg"];

export function Builder({ product, initial, fromPreset, design, projects, defaultProjectId }: Props) {
  const router = useRouter();
  const cart = useCart();
  const toast = useToast();
  const { user } = useUser();
  const draftKey = `ie_draft_${product}`;

  const [cfg, setCfg] = useState<DesignConfig>(initial);
  const [step, setStep] = useState(design ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState(design?.name ?? "");
  const [projectId, setProjectId] = useState<string>(design?.projectId ?? defaultProjectId ?? projects[0]?.id ?? "new");
  const [newProject, setNewProject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<null | "save" | "cart" | "buy">(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(design?.id ?? null);
  const pending = useRef<null | "save" | "cart" | "buy">(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // restore an unsaved draft (only for a fresh build)
  useEffect(() => {
    if (design || fromPreset) return;
    try {
      const d = localStorage.getItem(draftKey);
      if (d) setCfg((c) => ({ ...c, ...JSON.parse(d) }));
    } catch {}
  }, [design, fromPreset, draftKey]);
  useEffect(() => {
    if (design) return;
    const t = setTimeout(() => {
      try {
        if (!cfg.imageUrl?.startsWith("blob:")) localStorage.setItem(draftKey, JSON.stringify(cfg));
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [cfg, design, draftKey]);

  // keep focused/scrolled-to controls clear of the sticky preview + bottom bar on phones
  useEffect(() => {
    const el = document.documentElement;
    const apply = () => {
      const mobile = window.innerWidth < 768;
      el.style.scrollPaddingTop = mobile ? "calc(44svh + 4.5rem)" : "";
      el.style.scrollPaddingBottom = mobile ? "6rem" : "";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      el.style.scrollPaddingTop = "";
      el.style.scrollPaddingBottom = "";
    };
  }, []);

  const set = useCallback((patch: Partial<DesignConfig>) => setCfg((c) => ({ ...c, ...patch })), []);
  const setTransform = useCallback((t: DesignConfig["transform"]) => setCfg((c) => ({ ...c, transform: t })), []);
  const price = priceOf(cfg);
  const P = PRODUCTS[product];

  const go = (n: number) => {
    if (n < 0 || n >= STEPS.length) return;
    setDir(n > step ? 1 : -1);
    setStep(n);
    if (window.innerWidth < 768) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------- upload ----------
  async function onFile(f: File | undefined) {
    if (!f) return;
    const local = URL.createObjectURL(f);
    set({ imageUrl: local, transform: { x: 0, y: 0, scale: 1, rotation: 0 } });
    setUploading(true);
    try {
      const blob = await downscale(f, 2400);
      const fd = new FormData();
      fd.append("file", blob, "upload.jpg");
      const r = await api<{ id: string; url: string }>("/api/uploads", fd);
      set({ imageUrl: r.url, uploadId: r.id });
      if (step === 0) go(1);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  // ---------- save / cart ----------
  async function persist(): Promise<string | null> {
    const { url: thumbnail } = await exportDesign(cfg, 640, "image/jpeg", 0.82);
    const body = {
      id: savedId,
      name: name.trim() || `${P.name.replace("Custom ", "")} ${new Date().toLocaleDateString()}`,
      projectId: projectId === "new" ? null : projectId,
      newProjectName: projectId === "new" ? newProject.trim() || "My Project" : undefined,
      config: cfg,
      thumbnail,
    };
    const r = await api<{ design: { id: string; projectId: string } }>("/api/designs", body);
    setSavedId(r.design.id);
    setProjectId(r.design.projectId);
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    return r.design.id;
  }

  async function act(kind: "save" | "cart" | "buy") {
    if (!cfg.imageUrl) {
      toast("Add your image first");
      return go(1);
    }
    if (uploading) return toast("Hang tight, still uploading…");
    if (kind === "save" && !user) {
      pending.current = kind;
      return setAuthOpen(true);
    }
    setBusy(kind);
    try {
      let id = savedId;
      if (user) id = await persist();
      if (kind === "save") {
        toast("Saved to your projects", { label: "Open", href: `/projects/${projectId === "new" ? "" : projectId}` });
        router.refresh();
        return;
      }
      const { url: thumb } = await exportDesign(cfg, 480, "image/jpeg", 0.8);
      cart.add({ kind: "design", designId: id ?? undefined, title: name.trim() || P.name, price, thumb, config: cfg, details: describe(cfg) });
      if (kind === "buy") router.push("/checkout");
      else toast("Added to cart", { label: "Checkout", href: "/checkout" });
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (user && pending.current) {
      const k = pending.current;
      pending.current = null;
      act(k);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // keyboard: arrows move image (no animation)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const d = e.shiftKey ? 0.05 : 0.01;
      const t = cfg.transform;
      if (e.key === "ArrowLeft") setTransform({ ...t, x: t.x - d });
      else if (e.key === "ArrowRight") setTransform({ ...t, x: t.x + d });
      else if (e.key === "ArrowUp") setTransform({ ...t, y: t.y - d });
      else if (e.key === "ArrowDown") setTransform({ ...t, y: t.y + d });
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [cfg.transform, setTransform]);

  const projectOptions = useMemo(() => projects, [projects]);

  return (
    <div className="min-h-dvh bg-[radial-gradient(80%_60%_at_30%_20%,#1a0607_0%,#08080a_60%)]">
      {/* ---------- top bar ---------- */}
      <div className="fixed inset-x-0 top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-6">
          <Link href={design ? `/projects/${design.projectId}` : "/build"} className="press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10" aria-label="Close builder">
            <X size={18} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => go(i)} className="group min-w-0 flex-1 text-left">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full origin-left rounded-full" style={{ background: "var(--color-fg)" }} initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }} />
                </div>
                <span className={`font-tag mt-1 hidden truncate text-[0.62rem] sm:block ${i === step ? "text-fg" : "text-muted"}`}>
                  {i + 1}. {s.label}
                </span>
              </button>
            ))}
          </div>
          <motion.div key={price} initial={{ y: -6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="font-display shrink-0 text-xl md:text-3xl">
            {money(price)}
          </motion.div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-0 pt-16 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-8 md:px-6 md:pt-24">
        {/* ---------- preview ---------- */}
        <div className="sticky top-16 z-20 min-w-0 md:top-24 md:self-start">
          <div className="relative h-[44svh] overflow-hidden bg-[radial-gradient(70%_60%_at_50%_45%,#26262e_0%,#0d0d10_70%)] md:h-[calc(100svh-8rem)] md:rounded-[2rem] md:ring-1 md:ring-line">
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(255,30,30,0.06))]" />
            <DesignCanvas config={cfg} interactive={!!cfg.imageUrl} onTransform={setTransform} className="absolute inset-0" />
            {uploading && (
              <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs backdrop-blur">
                <Loader2 size={14} className="animate-spin" /> Uploading…
              </div>
            )}
            {cfg.imageUrl && step === 1 && (
              <div className="pointer-events-none absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 font-tag text-[0.6rem] text-fg/80 backdrop-blur">
                <Move size={12} /> Drag · Pinch · Twist
              </div>
            )}
            {!cfg.imageUrl && (
              <button onClick={() => fileRef.current?.click()} className="absolute inset-0 grid place-items-center">
                <span className="btn mt-[30%]">
                  <ImagePlus size={16} /> Add your image
                </span>
              </button>
            )}
            <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-fg/70 backdrop-blur">{describe(cfg)[0]}</div>
          </div>
        </div>

        {/* ---------- controls ---------- */}
        <div className="relative min-w-0 px-4 pb-40 pt-6 md:px-0 md:pb-24 md:pt-0">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 36, filter: "blur(6px)" }),
                center: { opacity: 1, x: 0, filter: "blur(0px)" },
                exit: (d: number) => ({ opacity: 0, x: d * -24, filter: "blur(4px)", transition: { duration: 0.16 } }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="text-sm text-muted">Step {step + 1} of 4</p>
              <h1 className="font-display mt-1 text-4xl md:text-5xl">{STEPS[step].title}</h1>

              {step === 0 && (
                <div className="mt-6 space-y-8">
                  <Group label={P.name}>
                    <div className="grid grid-cols-2 gap-2">
                      {P.sizes.map((s) => (
                        <button key={s.id} data-on={cfg.size === s.id} onClick={() => set({ size: s.id })} className="chip p-4 text-left">
                          <div className="text-lg font-semibold leading-tight">{s.label}</div>
                          <div className="mt-1 text-xs text-muted">{s.dims}</div>
                          <div className="mt-3 text-sm font-semibold">{money(s.price)}</div>
                          {cfg.size === s.id && <Check size={16} className="absolute right-3 top-3 text-red" />}
                        </button>
                      ))}
                    </div>
                  </Group>
                  {product === "wall" && (
                    <Group label="Orientation">
                      <div className="grid grid-cols-2 gap-2">
                        {(["landscape", "portrait"] as const).map((o) => (
                          <button key={o} data-on={cfg.orientation === o} onClick={() => set({ orientation: o })} className="chip flex items-center gap-3 p-4 capitalize">
                            <span className={`inline-block rounded-sm ring-2 ring-fg/60 ${o === "landscape" ? "h-5 w-7" : "h-7 w-5"}`} /> {o}
                          </button>
                        ))}
                      </div>
                    </Group>
                  )}
                  <Group label={P.frameLabel}>
                    <Swatches items={FRAMES.map((f) => ({ id: f.id, label: f.label, bg: `linear-gradient(135deg, ${f.shine}, ${f.color} 55%, ${f.color})` }))} value={cfg.frame} onChange={(v) => set({ frame: v })} />
                  </Group>
                </div>
              )}

              {step === 1 && (
                <div className="mt-6 space-y-8">
                  <Group label="Image">
                    <div className="flex gap-2">
                      <button onClick={() => fileRef.current?.click()} className="btn flex-1">
                        <ImagePlus size={16} /> {cfg.imageUrl ? "Change image" : "Upload image"}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-muted">Or try a sample:</p>
                    <div className="mt-2 flex gap-2">
                      {SAMPLES.map((s) => (
                        <button key={s} onClick={() => set({ imageUrl: s, uploadId: null, transform: { x: 0, y: 0, scale: 1, rotation: 0 } })} className={`press h-14 w-14 overflow-hidden rounded-xl ring-2 ${cfg.imageUrl === s ? "ring-red" : "ring-white/10"}`}>
                          <img src={s} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </Group>

                  {cfg.imageUrl && (
                    <Group label="Position">
                      <div className="panel space-y-4 p-4">
                        <Slider label="Size" min={0.3} max={3} step={0.01} value={cfg.transform.scale} onChange={(v) => setTransform({ ...cfg.transform, scale: v })} fmt={(v) => `${Math.round(v * 100)}%`} />
                        <Slider label="Rotate" min={-180} max={180} step={1} value={cfg.transform.rotation} onChange={(v) => setTransform({ ...cfg.transform, rotation: v })} fmt={(v) => `${v}°`} />
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm flex-1" onClick={() => setTransform({ ...cfg.transform, rotation: cfg.transform.rotation - 90 })}>
                            <RotateCcw size={14} /> 90°
                          </button>
                          <button className="btn btn-ghost btn-sm flex-1" onClick={() => setTransform({ ...cfg.transform, rotation: cfg.transform.rotation + 90 })}>
                            <RotateCw size={14} /> 90°
                          </button>
                          <button className="btn btn-ghost btn-sm flex-1" onClick={() => setTransform({ x: 0, y: 0, scale: 1, rotation: 0 })}>
                            <Crosshair size={14} /> Reset
                          </button>
                        </div>
                      </div>
                    </Group>
                  )}

                  <Group label="Filter">
                    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
                      {FILTERS.map((f) => (
                        <button key={f.id} onClick={() => set({ filter: f.id })} className="press shrink-0 text-center">
                          <div className={`h-16 w-16 overflow-hidden rounded-2xl ring-2 transition ${cfg.filter === f.id ? "ring-red" : "ring-white/10"}`}>
                            <img src={cfg.imageUrl ?? "/media/ponds-top.jpg"} alt="" className="h-full w-full object-cover" style={{ filter: f.css }} />
                          </div>
                          <span className={`mt-1 block text-[11px] ${cfg.filter === f.id ? "text-fg" : "text-muted"}`}>{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </Group>

                </div>
              )}

              {step === 2 && (
                <div className="mt-6 space-y-8">
                  <Group label="Topcoat">
                    <div className="grid gap-2">
                      {TOPCOATS.map((t) => (
                        <button key={t.id} data-on={cfg.topcoat === t.id} onClick={() => set({ topcoat: t.id })} className="chip flex items-center gap-4 p-4 text-left">
                          <span className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-white/15" style={{ background: t.id === "gloss" ? "linear-gradient(135deg,#444 0%,#111 45%,#fff 50%,#222 56%,#111 100%)" : t.id === "satin" ? "linear-gradient(135deg,#3a3a40,#1a1a1f 60%,#2c2c33)" : "#1d1d22" }} />
                          <div>
                            <div className="text-lg font-semibold leading-tight">{t.label}</div>
                            <div className="mt-1 text-xs text-muted">{t.hint}</div>
                          </div>
                          {cfg.topcoat === t.id && <Check size={18} className="ml-auto text-red" />}
                        </button>
                      ))}
                    </div>
                  </Group>
                  <Group label={`Metal flake ${cfg.flake !== "none" ? `· +${money(P.flakePrice)}` : ""}`}>
                    <Swatches
                      items={FLAKES.map((f) => ({ id: f.id, label: f.label, bg: f.color.length ? `radial-gradient(circle at 30% 30%, ${f.color[0]}, ${f.color[1]} 40%, ${f.color[f.color.length - 1]})` : "repeating-linear-gradient(45deg,#222 0 4px,#2c2c33 4px 8px)" }))}
                      value={cfg.flake}
                      onChange={(v) => set({ flake: v })}
                    />
                  </Group>
                  <Group label="Overlay · pick one (optional)">
                    <div className="grid grid-cols-4 gap-2">
                      {[{ id: "none", label: "None", hint: "Just the pour" }, ...EFFECTS].map((e) => {
                        const on = e.id === "none" ? cfg.effects.length === 0 : cfg.effects[0] === e.id;
                        return (
                          <button key={e.id} data-on={on} onClick={() => set({ effects: e.id === "none" ? [] : [e.id] })} className="chip px-2 py-3 text-center">
                            <FxIcon id={e.id} />
                            <div className="mt-1.5 text-xs font-medium">{e.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </Group>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6 space-y-6">
                  <div className="panel overflow-hidden">
                    <ul className="divide-y divide-line text-sm">
                      {describe(cfg).map((d) => (
                        <li key={d} className="flex items-center gap-3 px-4 py-3">
                          <Check size={14} className="text-red" /> {d}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-line bg-white/[0.03] px-4 py-4">
                      <span className="font-tag text-xs text-muted">Total</span>
                      <span className="font-display text-3xl">{money(price)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="label">Name this design</label>
                    <input className="input" placeholder="e.g. Tigers helmet, Mom's table…" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Save into project</label>
                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                      {projectOptions.map((p) => (
                        <button key={p.id} data-on={projectId === p.id} onClick={() => setProjectId(p.id)} className="chip shrink-0 px-4 py-2.5 text-sm">
                          {p.name} <span className="text-muted">· {p.count}</span>
                        </button>
                      ))}
                      <button data-on={projectId === "new"} onClick={() => setProjectId("new")} className="chip flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm">
                        <FolderPlus size={14} /> New
                      </button>
                    </div>
                    {projectId === "new" && <input className="input mt-2" placeholder="Project name, e.g. Football Team" value={newProject} onChange={(e) => setNewProject(e.target.value)} />}
                    <p className="mt-2 text-xs text-muted">Projects hold several designs, so you can compare them side by side before you buy.</p>
                  </div>

                  <div className="grid gap-2">
                    <button onClick={() => act("buy")} className="btn h-14" disabled={!!busy}>
                      {busy === "buy" ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />} Buy now · {money(price)}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => act("cart")} className="btn btn-ghost h-12" disabled={!!busy}>
                        {busy === "cart" ? <Loader2 className="animate-spin" size={16} /> : <ShoppingBag size={16} />} Add to cart
                      </button>
                      <button onClick={() => act("save")} className="btn btn-ghost h-12" disabled={!!busy}>
                        {busy === "save" ? <Loader2 className="animate-spin" size={16} /> : <FolderPlus size={16} />} {savedId ? "Update" : "Save"}
                      </button>
                    </div>
                    {savedId && (
                      <Link href={`/projects/${projectId}`} className="font-tag mt-2 text-center text-xs text-red">
                        Open project →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ---------- step nav ---------- */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 p-3 backdrop-blur-xl md:static md:mt-10 md:border-0 md:bg-transparent md:p-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <div className="mx-auto flex max-w-xl gap-2">
              {step > 0 && (
                <button onClick={() => go(step - 1)} className="btn btn-ghost h-14 w-14 shrink-0 px-0" aria-label="Back">
                  <ArrowLeft size={18} />
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => (step === 1 && !cfg.imageUrl ? fileRef.current?.click() : go(step + 1))} className="btn h-14 flex-1">
                  {step === 1 && !cfg.imageUrl ? (
                    <>
                      <ImagePlus size={16} /> Upload image
                    </>
                  ) : (
                    <>
                      Next: {STEPS[step + 1].label} <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button onClick={() => act("buy")} className="btn h-14 flex-1 md:hidden" disabled={!!busy}>
                  <Zap size={16} /> Buy now · {money(price)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} reason="Create a free account to save designs and come back to them anytime." />
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

function Swatches({ items, value, onChange }: { items: { id: string; label: string; bg: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((i) => (
        <button key={i.id} onClick={() => onChange(i.id)} className="press flex w-16 flex-col items-center gap-1.5">
          <span className={`h-12 w-12 rounded-full ring-2 ring-offset-2 ring-offset-ink transition ${value === i.id ? "ring-red" : "ring-transparent"}`} style={{ background: i.bg, boxShadow: "inset 0 2px 4px rgba(255,255,255,.35), inset 0 -3px 6px rgba(0,0,0,.4)" }} />
          <span className={`text-center text-[11px] leading-tight ${value === i.id ? "text-fg" : "text-muted"}`}>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange, fmt }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <label className="flex items-center gap-3 text-xs">
      <span className="w-12 text-muted">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1 accent-[#e5242b]" />
      <span className="w-12 text-right tabular-nums">{fmt(value)}</span>
    </label>
  );
}

function FxIcon({ id }: { id: string }) {
  const bg: Record<string, string> = {
    sparkle: "radial-gradient(circle, #fff 0 8%, rgba(255,214,120,.6) 20%, transparent 55%), #1a1a1f",
    glitter: "radial-gradient(#fff 1px, transparent 1.5px) 0 0/6px 6px, #26262c",
    goldflake: "linear-gradient(135deg,#fff1b8,#e6ac2c 50%,#8a5a00)",
    galaxy: "radial-gradient(circle at 30% 30%, #7a28ff, transparent 55%), radial-gradient(circle at 70% 70%, #ff1e5a, transparent 55%), #0b0b18",
    holo: "linear-gradient(135deg,#ff5ef7,#5ef1ff,#fff35e,#7bff5e)",
    neon: "#111",
    vignette: "radial-gradient(circle, #777 0 30%, #000 75%)",
    none: "repeating-linear-gradient(45deg,#1c1c20 0 4px,#24242a 4px 8px)",
  };
  return <span className="mx-auto block h-9 w-9 rounded-full ring-1 ring-white/15" style={{ background: bg[id], boxShadow: id === "neon" ? "inset 0 0 0 2px #e5242b" : undefined }} />;
}

async function downscale(file: File, max: number): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("That file type isn't supported. Try a JPG or PNG."));
      i.src = url;
    });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.9));
  } finally {
    URL.revokeObjectURL(url);
  }
}
