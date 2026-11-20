"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Heart, Pencil, Share2, ShoppingBag, X } from "lucide-react";
import { DesignCanvas } from "./design-canvas";
import { api, useCart, useToast } from "./providers";
import { DesignConfig, PRODUCTS, describe, money } from "@/lib/design";
import { exportDesign } from "@/lib/render";

type D = { id: string; name: string; price: number; liked: boolean; config: DesignConfig };

export function DisplayMode({ project, designs: initial, start }: { project: { id: string; name: string }; designs: D[]; start: number }) {
  const [designs, setDesigns] = useState(initial);
  const [[i, dir], setI] = useState<[number, number]>([start, 0]);
  const [sheen, setSheen] = useState(0.32);
  const cart = useCart();
  const toast = useToast();
  const d = designs[i];

  const go = useCallback((n: number) => setI(([cur]) => [(n + designs.length) % designs.length, n > cur ? 1 : -1]), [designs.length]);

  // tilt (mouse or phone gyro) -> 3D rotation + moving reflection
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-14, 14]), { stiffness: 120, damping: 14 });
  const last = useRef(0);
  const asked = useRef(false);
  const tilt = useCallback(
    (x: number, y: number) => {
      mx.set(x);
      my.set(y);
      const now = performance.now();
      if (now - last.current > 50) {
        last.current = now;
        setSheen(0.32 + x * 0.28 + y * 0.1);
      }
    },
    [mx, my]
  );
  useEffect(() => {
    const o = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    };
    window.addEventListener("deviceorientation", o);
    return () => window.removeEventListener("deviceorientation", o);
  }, [tilt]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
      if (e.key === "Escape") window.location.href = `/projects/${project.id}`;
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [go, i, project.id]);

  useEffect(() => {
    history.replaceState(null, "", `?i=${i}`);
  }, [i]);

  async function like() {
    const v = !d.liked;
    setDesigns((ds) => ds.map((x) => (x.id === d.id ? { ...x, liked: v } : x)));
    if (v) toast("Marked as a favorite ♥");
    await api(`/api/designs/${d.id}`, { liked: v }, "PATCH").catch(() => {});
  }

  async function share(save = false) {
    const { blob, url } = await exportDesign(d.config, 1800);
    const file = new File([blob], `${d.name.replace(/[^\w-]+/g, "-")}.png`, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    try {
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: d.name, text: save ? undefined : `Check out my ${PRODUCTS[d.config.product].name.toLowerCase()} idea from Imprint Epoxy` });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    toast(save ? "Image saved" : "Image downloaded. Share it anywhere");
  }

  function addCart() {
    exportDesign(d.config, 480, "image/jpeg", 0.8).then(({ url }) => {
      cart.add({ kind: "design", designId: d.id, title: d.name, price: d.price, thumb: url, config: d.config, details: describe(d.config) });
      toast(`${d.name} added`, { label: "Checkout", href: "/checkout" });
    });
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[radial-gradient(80%_60%_at_50%_40%,#22070a_0%,#060607_65%)] text-fg"
      onPointerDown={() => {
        // iOS needs explicit permission for tilt-to-shine
        const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
        if (D.requestPermission && !asked.current) {
          asked.current = true;
          D.requestPermission().catch(() => {});
        }
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        tilt((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      {/* floor glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(255,30,30,0.18),transparent)]" />

      <div className="relative z-10 flex items-center gap-3 p-4" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <Link href={`/projects/${project.id}`} className="press grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur" aria-label="Close">
          <X size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-tag truncate text-[0.62rem] text-muted">{project.name}</p>
          <p className="truncate text-lg font-semibold">{d.name}</p>
        </div>
        <span className="font-tag rounded-full bg-white/10 px-3 py-1.5 text-xs tabular-nums">
          {i + 1} / {designs.length}
        </span>
      </div>

      {/* stage */}
      <div className="relative flex-1" style={{ perspective: 1200 }}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={d.id}
            custom={dir}
            className="absolute inset-0 touch-pan-y"
            drag={designs.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -400) go(i + 1);
              else if (info.offset.x > 60 || info.velocity.x > 400) go(i - 1);
            }}
            variants={{
              enter: (dd: number) => ({ x: dd >= 0 ? "60%" : "-60%", opacity: 0, scale: 0.9, filter: "blur(8px)" }),
              center: { x: 0, opacity: 1, scale: 1, filter: "blur(0px)" },
              exit: (dd: number) => ({ x: dd >= 0 ? "-60%" : "60%", opacity: 0, scale: 0.9, filter: "blur(8px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", duration: 0.5, bounce: 0.12 }}
          >
            <motion.div className="h-full w-full" style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
              <DesignCanvas config={d.config} sheen={sheen} className="h-full w-full" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {designs.length > 1 && (
          <>
            <button onClick={() => go(i - 1)} className="press absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur md:grid" aria-label="Previous">
              <ChevronLeft />
            </button>
            <button onClick={() => go(i + 1)} className="press absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur md:grid" aria-label="Next">
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {/* info + actions */}
      <div className="relative z-10 mx-auto w-full max-w-xl px-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="mb-3 flex justify-center gap-1.5">
          {designs.map((x, k) => (
            <button key={x.id} onClick={() => go(k)} className="p-1" aria-label={`Design ${k + 1}`}>
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${k === i ? "w-6 bg-red" : "w-1.5 bg-white/30"}`} />
            </button>
          ))}
        </div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="truncate text-muted">{describe(d.config).slice(0, 2).join(" · ")}</span>
          <span className="font-display shrink-0 text-2xl">{money(d.price)}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          <Action onClick={like} label={d.liked ? "Liked" : "Like"} active={d.liked}>
            <Heart size={20} className={d.liked ? "fill-red text-red" : ""} />
          </Action>
          <Action onClick={() => share(false)} label="Share">
            <Share2 size={20} />
          </Action>
          <Action onClick={() => share(true)} label="Save">
            <Download size={20} />
          </Action>
          <Link href={`/build/${d.config.product}?design=${d.id}`} className="press flex flex-col items-center gap-1 rounded-2xl bg-white/[0.07] py-2.5 text-[11px]">
            <Pencil size={20} /> Edit
          </Link>
          <button onClick={addCart} className="press flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px]" style={{ background: "var(--candy)" }}>
            <ShoppingBag size={20} /> Cart
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted">Swipe to compare · tilt your phone to see the shine</p>
      </div>
    </div>
  );
}

function Action({ onClick, label, children, active }: { onClick: () => void; label: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button onClick={onClick} className={`press flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] ${active ? "bg-red/15 ring-1 ring-red/40" : "bg-white/[0.07]"}`}>
      {children}
      {label}
    </button>
  );
}
