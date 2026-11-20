import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShopGrid } from "@/components/shop-grid";

export const metadata = { title: "Shop" };

export default function Shop() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 md:px-8">
      <h1 className="font-display text-5xl md:text-6xl">Shop</h1>
      <p className="mt-3 max-w-lg text-muted">Finished pieces, hand-poured and ready to go. Hover to see the real photo.</p>
      <div className="mt-10">
        <ShopGrid />
      </div>
      <Link href="/build" className="press group mt-16 flex items-center justify-between rounded-2xl border border-line px-6 py-5 transition-colors hover:bg-white/[0.03]">
        <span>
          <span className="block font-medium">Want one with your own photo?</span>
          <span className="block text-sm text-muted">Design a table, helmet display or wall piece in about a minute.</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-muted transition-colors group-hover:text-fg" />
      </Link>
    </div>
  );
}
