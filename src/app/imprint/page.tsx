import Link from "next/link";
import { ArrowRight, HandHeart, Mic, Store } from "lucide-react";

export const metadata = { title: "Supported by Imprint" };

export default function Imprint() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 md:px-6">
      <div className="relative">
        <img src="/media/logo.webp" alt="Imprint" className="pointer-events-none absolute -right-10 -top-16 w-[420px] opacity-25 md:-right-24 md:w-[560px]" />
        <p className="font-tag text-xs text-red">Supported by Imprint</p>
        <h1 className="font-display relative mt-2 text-6xl font-black md:text-8xl">
          <span className="chrome-text block">Leave an imprint,</span>
          <span className="red-text block">not just a mark.</span>
        </h1>
      </div>

      {/* ~110 word bio */}
      <div className="relative mt-10 max-w-2xl space-y-4 text-lg leading-relaxed text-fg/85">
        <p>
          Imprint Epoxy Design is the hands-on side of <b className="text-fg">Imprint</b>, a nonprofit built on one idea: everyone deserves to leave their mark. Imprint helps people in our community tell their story, grow their business, and put something positive into the world instead of standing on the sidelines.
        </p>
        <p>
          The epoxy studio carries that same spirit into every pour. Your team, your family, your logo, sealed under a glass-deep coat built to last for generations. Every piece we sell helps fund Imprint’s work. So when you order, you’re not just buying art. <b className="text-fg">You’re leaving an imprint.</b>
        </p>
      </div>

      <div className="stagger mt-12 grid gap-3 md:grid-cols-3">
        {[
          { icon: Mic, t: "Tell your story", d: "We help people share where they came from and what they’re building." },
          { icon: Store, t: "Back the business", d: "Spotlights, support and a push for local entrepreneurs." },
          { icon: HandHeart, t: "Make an impact", d: "Doing something positive beats doing nothing. Every time." },
        ].map((x) => (
          <div key={x.t} className="panel p-5">
            <x.icon className="text-red" />
            <h3 className="font-display mt-3 text-3xl font-extrabold">{x.t}</h3>
            <p className="mt-1 text-sm text-muted">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {/* TODO: point this at Imprint's own site when it's live */}
        <a href="#" className="btn">Learn more about Imprint <ArrowRight size={16} /></a>
        <Link href="/build" className="btn btn-ghost">Build a piece that gives back</Link>
      </div>
    </div>
  );
}
