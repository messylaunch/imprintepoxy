import Link from "next/link";
import { ArrowRight, Upload, Move, Droplets } from "lucide-react";
import { Hero } from "@/components/hero";
import { ShopCard, ConceptCard } from "@/components/cards";
import { PieceTiles } from "@/components/piece-tiles";
import { SHOP, CONCEPTS } from "@/lib/catalog";

export default function Home() {
  return (
    <>
      <Hero />

      {/* tag ribbon, like the logo banner */}
      <div className="relative -mt-6 -rotate-1 overflow-hidden border-y border-white/10 bg-black py-3">
        <div className="marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center gap-6 pr-6 font-tag text-sm text-fg/90">
              {["Custom Epoxy Art", "Tables", "Wall Art", "Helmet Displays", "Family Pieces", "Team Gifts", "Business Logos"].map((t) => (
                <span key={t} className="flex items-center gap-6">
                  {t} <span className="h-4 w-[3px] skew-x-[-18deg] bg-red" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Section kicker="Step one" title="Pick your piece" action={{ href: "/build", label: "All options" }}>
        <PieceTiles />
      </Section>

      <Section kicker="Off the bench" title="Shop finished work" action={{ href: "/shop", label: "Full catalog" }}>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {SHOP.map((s) => (
            <div key={s.slug} className="w-[78vw] max-w-sm shrink-0 snap-start md:w-auto">
              <ShopCard item={s} />
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="Ideas we can pour" title="Steal an idea" sub="Concepts rendered with our builder. Tap one, swap in your own photo, done.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => (
            <ConceptCard key={c.slug} c={c} />
          ))}
        </div>
      </Section>

      <Section kicker="How it works" title="Three steps. That's it.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Upload, t: "Drop your image", d: "Team photo, family portrait, logo, a name in script. Anything." },
            { icon: Move, t: "Drag & dress it", d: "Slide it into place, pinch to size, add filters, sparkles, gold leaf." },
            { icon: Droplets, t: "Pick your pour", d: "Mirror gloss, satin or matte, plus metal flake. We build it by hand." },
          ].map((s, i) => (
            <div key={s.t} className="panel relative overflow-hidden p-6">
              <span className="font-display absolute -right-2 -top-6 text-[8rem] font-black text-white/[0.04]">{i + 1}</span>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "var(--candy)" }}>
                <s.icon size={20} />
              </div>
              <h3 className="font-display text-3xl font-extrabold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Imprint band */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
        <div className="sheen relative overflow-hidden rounded-[2rem] p-8 ring-1 ring-red/30 md:p-14" style={{ background: "radial-gradient(120% 120% at 0% 0%, #3a0000 0%, #120203 55%, #08080a 100%)" }}>
          <img src="/media/logo.webp" alt="" className="pointer-events-none absolute -right-20 -top-10 w-[520px] opacity-20 md:opacity-30" />
          <p className="font-tag text-xs text-red">Supported by Imprint</p>
          <h2 className="font-display mt-3 max-w-2xl text-5xl font-black md:text-7xl">
            <span className="chrome-text">Every pour helps someone leave theirs.</span>
          </h2>
          <p className="mt-5 max-w-xl text-fg/80">Imprint Epoxy is powered by Imprint, a nonprofit helping people tell their story, build their business and make a real impact in their community.</p>
          <Link href="/imprint" className="btn btn-chrome mt-8">
            Meet Imprint <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* event CTA */}
      <section className="mx-auto mt-10 max-w-7xl px-4 md:px-6">
        <div className="panel flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex-1">
            <h3 className="font-display text-4xl font-extrabold">Got an idea right now?</h3>
            <p className="mt-2 text-sm text-muted">Start a project in under a minute. Save it, show your family, and talk to us right on your design.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/build/custom" className="btn btn-ghost">Special request</Link>
            <Link href="/build" className="btn">Start building</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ kicker, title, sub, action, children }: { kicker: string; title: string; sub?: string; action?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-tag text-xs text-red">{kicker}</p>
          <h2 className="font-display mt-2 text-5xl font-black md:text-7xl">{title}</h2>
          {sub && <p className="mt-3 max-w-xl text-sm text-muted">{sub}</p>}
        </div>
        {action && (
          <Link href={action.href} className="font-tag hidden shrink-0 items-center gap-1 text-xs text-fg/70 hover:text-red md:flex">
            {action.label} <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
