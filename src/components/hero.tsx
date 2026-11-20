"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { site } from "@/lib/site";

/** Hero. Uses real pour footage if site.heroVideo is set, otherwise an animated
 *  "wet epoxy" reveal that flows down over a finished table. */
export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {site.heroVideo ? (
          <video src={site.heroVideo} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        ) : (
          <PourBackdrop />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_30%,#08080a_88%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      </div>
      <Drips />

      <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-32 pt-28 md:px-6 md:pb-24">
        <div className="stagger max-w-3xl">
          <Link href="/imprint" className="press mb-5 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs ring-1 ring-white/15 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red shadow-[0_0_8px_#ff1f1f]" />
            <span className="font-tag text-[0.65rem] text-fg/80">Supported by Imprint</span>
            <ArrowRight size={12} className="text-fg/60" />
          </Link>
          <h1 className="font-display text-[clamp(3.6rem,13vw,9.5rem)] font-black">
            <span className="chrome-text block">Leave your</span>
            <span className="red-text block drip-shadow">mark.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-fg/80 md:text-lg">
            Custom epoxy <b className="text-fg">tables</b>, <b className="text-fg">helmet displays</b> & <b className="text-fg">wall art</b>. Drop in your photo, drag it into place, pick your pour. We seal it forever.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/build" className="btn h-14 px-7 text-[0.9rem]">
              <Sparkles size={18} /> Build your own
            </Link>
            <Link href="/shop" className="btn btn-ghost h-14 px-7 text-[0.9rem]">
              Shop finished pieces
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PourBackdrop() {
  return (
    <div className="absolute inset-0">
      <img src="/media/ponds-table.jpg" alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-70" />
      {/* the "wet" layer: brighter, glossier copy revealed by a flowing mask */}
      <img src="/media/ponds-table.jpg" alt="" className="kenburns pour-mask absolute inset-0 h-full w-full object-cover" style={{ filter: "contrast(1.2) saturate(1.35) brightness(1.15)" }} />
      <div className="pour-edge absolute inset-x-0 h-40" />
      <style>{`
        .kenburns { animation: kb 22s ease-in-out infinite alternate; transform-origin: 60% 40%; }
        @keyframes kb { from { transform: scale(1.08) } to { transform: scale(1.18) translate(-1.5%, 1%) } }
        .pour-mask {
          -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 40%, transparent 50%, transparent 100%);
          mask-image: linear-gradient(180deg, #000 0%, #000 40%, transparent 50%, transparent 100%);
          -webkit-mask-size: 100% 250%; mask-size: 100% 250%;
          animation: pour 8s cubic-bezier(.45,.05,.3,1) infinite;
        }
        @keyframes pour { 0% { -webkit-mask-position: 0 100%; mask-position: 0 100%; } 70%,100% { -webkit-mask-position: 0 0%; mask-position: 0 0%; } }
        .pour-edge {
          background: linear-gradient(180deg, transparent, rgba(255,255,255,.18) 45%, rgba(255,60,60,.25) 55%, transparent);
          filter: blur(14px); mix-blend-mode: screen;
          animation: edge 8s cubic-bezier(.45,.05,.3,1) infinite;
        }
        @keyframes edge { 0% { top: -10%; opacity: 0 } 8% { opacity: 1 } 62% { opacity: 1 } 70%,100% { top: 105%; opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .kenburns, .pour-mask, .pour-edge { animation: none } }
      `}</style>
    </div>
  );
}

/** Candy-red drips hanging from the top edge, like the logo. Fixed pixel widths so they never stretch. */
function Drips() {
  const drips = [
    { x: 6, h: 70, d: 0 }, { x: 14, h: 120, d: 0.4 }, { x: 23, h: 50, d: 1.1 }, { x: 37, h: 95, d: 0.2 },
    { x: 52, h: 150, d: 0.8 }, { x: 64, h: 60, d: 1.4 }, { x: 76, h: 110, d: 0.5 }, { x: 88, h: 80, d: 1.0 }, { x: 95, h: 45, d: 0.3 },
  ];
  const candy = "linear-gradient(90deg,#8a0000,#ff2a2a 45%,#ff8080 60%,#9a0000)";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-48" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: "linear-gradient(180deg,#ff3a3a,#9a0000)" }} />
      {drips.map((d, i) => (
        <div key={i} className="drip absolute top-0 flex flex-col items-center" style={{ left: `${d.x}%`, animationDelay: `${d.d}s` }}>
          <div className="w-[7px] rounded-b-full" style={{ height: d.h, background: candy }} />
          <div className="-mt-2 h-[13px] w-[11px] rounded-full" style={{ background: candy, boxShadow: "inset 2px 2px 2px rgba(255,255,255,.45)" }} />
        </div>
      ))}
      <style>{`
        .drip { transform-origin: top; animation: drip 6s cubic-bezier(.5,0,.2,1) infinite; }
        @keyframes drip { 0% { transform: scaleY(0.05) } 60% { transform: scaleY(1) } 100% { transform: scaleY(1.04) } }
        @media (prefers-reduced-motion: reduce) { .drip { animation: none } }
      `}</style>
    </div>
  );
}
