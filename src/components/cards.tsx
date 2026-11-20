"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, ShoppingBag, Zap } from "lucide-react";
import type { ShopItem, Concept } from "@/lib/catalog";
import { money } from "@/lib/design";
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
    <div className="group flex flex-col">
      <Link href={`/shop/${item.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-ink-2">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]" loading="lazy" />
        {sold && <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium backdrop-blur">Sold · made to order</span>}
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <Link href={`/shop/${item.slug}`} className="min-w-0">
          <h3 className="truncate font-medium">{item.title}</h3>
          <p className="mt-0.5 truncate text-sm text-muted">{item.size}</p>
        </Link>
        <span className="shrink-0 font-medium">{money(item.price)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        {!sold && (
          <button onClick={() => buy(item)} className="btn btn-sm flex-1">
            Buy now
          </button>
        )}
        <Link href={`/build/${item.category}?from=${item.slug}`} className="btn btn-ghost btn-sm flex-1">
          <Hammer size={14} /> {sold ? "Make one like it" : "Customize"}
        </Link>
      </div>
    </div>
  );
}

export function ConceptCard({ c }: { c: Concept }) {
  return (
    <Link href={`/build/${c.config.product}?idea=${c.slug}`} className="press group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-2">
        {c.image ? (
          <img src={c.image} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]" />
        ) : (
          <DesignCanvas config={c.config} className="h-full w-full" maxDpr={1.5} />
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{c.title}</h3>
          <p className="mt-0.5 text-sm text-muted">{c.blurb}</p>
        </div>
        <span className="shrink-0 pt-0.5 text-sm text-fg/70 transition-colors group-hover:text-fg">Customize →</span>
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
