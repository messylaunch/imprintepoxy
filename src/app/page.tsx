import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { ShopCard, ConceptCard } from "@/components/cards";
import { PieceTiles } from "@/components/piece-tiles";
import { Faq } from "@/components/faq";
import { SHOP, CONCEPTS } from "@/lib/catalog";

export default function Home() {
  return (
    <>
      <Hero />

      <Section title="Start with the piece" sub="Every build begins the same way: choose what you want, then make it yours.">
        <PieceTiles />
      </Section>

      {/* how it works: plain, numbered, no decoration */}
      <section className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <h2 className="font-display text-4xl md:text-5xl">
            Three steps.
            <span className="font-serif block text-fg/70">About a minute.</span>
          </h2>
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              ["Upload", "A team photo, family portrait, logo or name. Anything you love."],
              ["Place & style", "Drag it into position, pinch to size, try a filter and an overlay."],
              ["Pick the finish", "Mirror gloss, satin or matte, with optional metal flake."],
            ].map(([t, d], i) => (
              <li key={t} className="bg-ink p-6">
                <span className="text-sm tabular-nums text-muted">0{i + 1}</span>
                <h3 className="mt-6 text-lg font-medium">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section title="Finished pieces" sub="Real work, ready to buy or remake with your own photo." action={{ href: "/shop", label: "View all" }}>
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {SHOP.map((s) => (
            <div key={s.slug} className="w-[72vw] max-w-xs shrink-0 snap-start md:w-auto md:max-w-none">
              <ShopCard item={s} />
            </div>
          ))}
        </div>
      </Section>

      {/* the pour */}
      <section className="relative mt-28 overflow-hidden">
        <video src="/media/gen/broll-helmet-panel.mp4" poster="/media/bcu-helmet-panel.jpg" autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" />
        <img src="/media/bcu-helmet-panel.jpg" alt="" className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,11,12,0.92)_0%,rgba(11,11,12,0.7)_45%,rgba(11,11,12,0.15)_100%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-40">
          <h2 className="font-display max-w-lg text-5xl md:text-6xl">
            Poured,
            <span className="font-serif block">not printed.</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-fg/75">Every piece gets a thick, glass-clear coat poured by hand, then cures for days. The result has real depth. It looks wet, and it lasts.</p>
          <Link href="/build" className="btn btn-chrome mt-8">
            Start your design <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Section title="Ideas to steal" sub="What your piece could look like at home. Tap one to start from it and swap in your own photo.">
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => (
            <ConceptCard key={c.slug} c={c} />
          ))}
        </div>
      </Section>

      <section id="faq" className="mx-auto mt-28 max-w-7xl scroll-mt-24 px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">Questions</h2>
            <p className="mt-3 max-w-xs text-muted">Anything else, tap the chat bubble. A real person answers.</p>
          </div>
          <Faq />
        </div>
      </section>

      {/* mission */}
      <section className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-line bg-ink-2 md:grid-cols-2">
          <div className="p-8 md:p-14">
            <p className="text-sm text-muted">Supported by Imprint</p>
            <h2 className="font-display mt-4 text-4xl md:text-5xl">
              Every piece helps someone
              <span className="font-serif"> leave theirs.</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">Imprint is our nonprofit. It helps people in the community tell their story, grow their business and make a real impact. Your order helps fund it.</p>
            <Link href="/imprint" className="btn btn-ghost mt-8">
              About Imprint <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative min-h-64 bg-[radial-gradient(70%_70%_at_50%_50%,#1f1012,#131315)]">
            <img src="/media/logo-640.webp" alt="Imprint Epoxy Design logo" className="absolute inset-0 m-auto w-[78%] max-w-md object-contain" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-3xl px-5 text-center">
        <h2 className="font-display text-4xl md:text-6xl">
          Ready when
          <span className="font-serif"> you are.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">Save as many designs as you like, compare them side by side, and buy the one you love.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/build" className="btn h-[52px] px-6">Design yours</Link>
          <Link href="/build/custom" className="btn btn-ghost h-[52px] px-6">Special request</Link>
        </div>
      </section>
    </>
  );
}

function Section({ title, sub, action, children }: { title: string; sub?: string; action?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-5 md:px-8">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
          {sub && <p className="mt-3 max-w-lg text-muted">{sub}</p>}
        </div>
        {action && (
          <Link href={action.href} className="hidden shrink-0 items-center gap-1.5 text-sm text-fg/70 hover:text-fg md:flex">
            {action.label} <ArrowRight size={15} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
