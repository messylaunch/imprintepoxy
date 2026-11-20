import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { money, PRODUCTS, ProductType } from "@/lib/design";

const tiles: { type: ProductType; title: string; blurb: string; image: string }[] = [
  { type: "table", title: "Tables", blurb: "Coffee, end, round & dining", image: "/media/gen/idea-gameday-coffee.webp" },
  { type: "helmet", title: "Helmet displays", blurb: "Helmet-cut wall pieces", image: "/media/gen/idea-helmet-mancave.webp" },
  { type: "wall", title: "Wall art", blurb: "Gallery panels, any photo", image: "/media/gen/idea-family-wall.webp" },
];

export function PieceTiles() {
  return (
    <div>
      <div className="stagger grid gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.type} href={`/build/${t.type}`} className="press group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-2 md:aspect-[3/4]">
              <img src={t.image} alt={t.title} className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <h3 className="font-display text-2xl">{t.title}</h3>
                  <p className="mt-1 text-sm text-fg/70">{t.blurb}</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fg text-ink transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight size={17} />
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">From {money(PRODUCTS[t.type].sizes[0].price)}</p>
          </Link>
        ))}
      </div>
      <Link href="/build/custom" className="press group mt-4 flex items-center justify-between rounded-2xl border border-line px-5 py-4 transition-colors hover:bg-white/[0.03]">
        <span>
          <span className="block font-medium">Have something else in mind?</span>
          <span className="block text-sm text-muted">Send us your photos or pieces and we&apos;ll quote a custom build.</span>
        </span>
        <ArrowUpRight size={18} className="shrink-0 text-muted transition-colors group-hover:text-fg" />
      </Link>
    </div>
  );
}
