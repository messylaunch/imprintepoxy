"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, ShoppingBag, Zap } from "lucide-react";
import type { ShopItem, Concept } from "@/lib/catalog";
import { money, PRODUCTS } from "@/lib/design";
import { useCart, useToast } from "./providers";
import { DesignCanvas } from "./design-canvas";

export function useBuyNow() {
  const cart = useCart();
  const router = useRouter();
  const toast = useToast();
  return (item: ShopItem, go = true) => {
    cart.add({ kind: "shop", slug: item.slug, title: item.title, price: item.price, thumb: item.image, details: [item.size] });
    if (go) router.push("/checkout");
    else toast(`${item.title} added`, { label: "View cart", href: "/cart" });
  };
}

export function ShopCard({ item }: { item: ShopItem }) {
  const buy = useBuyNow();
  const sold = item.status === "sold";
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[1.4rem] bg-ink-2 ring-1 ring-line">
      <Link href={`/shop/${item.slug}`} className="sheen relative block aspect-[4/5] overflow-hidden">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-tag text-[0.6rem] ring-1 ring-white/15 backdrop-blur">{PRODUCTS[item.category].name}</span>
        {sold && <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 font-tag text-[0.6rem] text-black">One of one · Sold</span>}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-2xl font-extrabold leading-none">{item.title}</h3>
          <p className="mt-1 text-xs text-fg/70">{item.size}</p>
        </div>
      </Link>
      <div className="flex items-center gap-2 p-3">
        <span className="mr-auto pl-1 font-display text-2xl font-extrabold">{money(item.price)}</span>
        <Link href={`/build/${item.category}?from=${item.slug}`} className="btn btn-ghost btn-sm" title="Build one like this">
          <Hammer size={14} /> {sold ? "Make mine" : "Remix"}
        </Link>
        {!sold && (
          <button onClick={() => buy(item)} className="btn btn-sm">
            <Zap size={14} /> Buy
          </button>
        )}
      </div>
    </div>
  );
}

export function ConceptCard({ c }: { c: Concept }) {
  return (
    <Link href={`/build/${c.config.product}?idea=${c.slug}`} className="press group relative block overflow-hidden rounded-[1.4rem] bg-[radial-gradient(90%_70%_at_50%_40%,#1d1d24,#0b0b0e)] ring-1 ring-line">
      <span className="absolute left-3 top-3 z-10 rounded-full bg-red/15 px-2.5 py-1 font-tag text-[0.6rem] text-red ring-1 ring-red/40">Concept</span>
      <DesignCanvas config={c.config} className="aspect-[5/4] w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]" maxDpr={1.5} />
      <div className="flex items-end justify-between gap-3 px-4 pb-4">
        <div>
          <h3 className="font-display text-xl font-extrabold leading-none">{c.title}</h3>
          <p className="mt-1 text-xs text-muted">{c.blurb}</p>
        </div>
        <span className="font-tag shrink-0 text-[0.65rem] text-red">Build it →</span>
      </div>
    </Link>
  );
}

export function AddToCartButton({ item }: { item: ShopItem }) {
  const buy = useBuyNow();
  return (
    <button onClick={() => buy(item, false)} className="btn btn-ghost h-14 flex-1">
      <ShoppingBag size={16} /> Add to cart
    </button>
  );
}
export function BuyNowButton({ item }: { item: ShopItem }) {
  const buy = useBuyNow();
  return (
    <button onClick={() => buy(item)} className="btn h-14 flex-1">
      <Zap size={16} /> Buy now · {money(item.price)}
    </button>
  );
}
