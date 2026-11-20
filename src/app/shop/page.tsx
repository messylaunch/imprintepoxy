import Link from "next/link";
import { ShopGrid } from "@/components/shop-grid";
import { ConceptCard } from "@/components/cards";
import { CONCEPTS } from "@/lib/catalog";

export const metadata = { title: "Shop" };

export default function Shop() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 md:px-6">
      <p className="text-sm text-muted">Catalog</p>
      <h1 className="font-display mt-2 text-5xl md:text-6xl">
        <span className="chrome-text">Ready to pour</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted">Finished pieces you can buy right now, or remix into your own. Every piece is hand-poured and sealed in high-gloss epoxy.</p>
      <div className="mt-10">
        <ShopGrid />
      </div>
      <div className="mt-20 flex items-end justify-between">
        <div>
          <p className="text-sm text-muted">Made to order</p>
          <h2 className="font-display mt-2 text-4xl md:text-5xl">Ideas we can make</h2>
        </div>
        <Link href="/build" className="btn btn-ghost btn-sm hidden md:inline-flex">Build from scratch</Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONCEPTS.map((c) => <ConceptCard key={c.slug} c={c} />)}
      </div>
    </div>
  );
}
