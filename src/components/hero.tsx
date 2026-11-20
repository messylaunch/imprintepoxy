"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden md:h-[92svh] md:min-h-[640px]">
      <div className="absolute inset-0 -z-10">
        {site.heroVideo ? <HeroVideo v={site.heroVideo} /> : <img src="/media/ponds-table.jpg" alt="" className="h-full w-full object-cover" />}
        {/* scrim only where the copy sits */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,11,12,0.95)_0%,rgba(11,11,12,0.55)_38%,rgba(11,11,12,0)_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,11,12,0.6)_0%,rgba(11,11,12,0)_55%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-28 pt-28 md:h-full md:min-h-0 md:px-8 md:pb-20">
        <div className="stagger max-w-3xl">
          <h1 className="font-display text-[clamp(2.5rem,7vw,5.6rem)]">
            <span className="whitespace-nowrap">Leave your mark,</span>
            <span className="font-serif block text-[1.08em] text-fg/90">sealed in glass.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-fg/75 md:mt-6 md:text-[1.05rem]">
            Custom epoxy tables, helmet displays and wall art made from your photos. Design it in about a minute. We pour it by hand.
          </p>
          <div className="mt-7 flex gap-3 md:mt-8">
            <Link href="/build" className="btn h-[52px] px-6">
              Design yours <ArrowRight size={17} />
            </Link>
            <Link href="/shop" className="btn btn-ghost h-[52px] px-6 backdrop-blur">
              <span className="sm:hidden">Shop</span>
              <span className="hidden sm:inline">Shop finished pieces</span>
            </Link>
          </div>
          <div className="mt-10 hidden flex-wrap gap-x-6 gap-y-2 text-sm text-fg/60 sm:flex">
            <span>Hand-poured</span>
            <span className="text-fg/25">/</span>
            <span>Pickup or shipping</span>
            <span className="text-fg/25">/</span>
            <Link href="/imprint" className="underline decoration-fg/30 underline-offset-4 hover:text-fg">Supports Imprint</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVideo({ v }: { v: NonNullable<typeof site.heroVideo> }) {
  // vertical cut on phones so the pour stays in frame
  const [mobile, setMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const f = () => setMobile(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  const poster = mobile ? v.posterMobile : v.poster;
  return (
    <div className="absolute inset-0">
      <img src={mobile === null ? v.poster : poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {mobile !== null && (
        <video key={mobile ? "m" : "d"} src={mobile ? v.mobile : v.desktop} poster={poster} autoPlay muted loop playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden" />
      )}
    </div>
  );
}
