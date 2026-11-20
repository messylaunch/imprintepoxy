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
  const sold = item.status === "sold";
  return (
    <Link href={`/shop/${item.slug}`} className="press group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-2">
        <img src={item.image} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
        {/* the real piece, revealed on hover */}
        <img src={item.photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="mt-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h3 className="line-clamp-2 font-medium leading-snug">{item.title}</h3>
        <span className="shrink-0 text-fg/90">{money(item.price)}</span>
      </div>
      <p className="mt-0.5 truncate text-sm text-muted">{sold ? "Made to order" : item.size}</p>
    </Link>
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
    <button onClick={() => buy(item, false)} className="btn btn-ghost h-14">
      <ShoppingBag size={16} /> Add to cart
    </button>
  );
}
export function BuyNowButton({ item }: { item: ShopItem }) {
  const buy = useBuyNow();
  return (
    <button onClick={() => buy(item)} className="btn h-14">
      Buy now · {money(item.price)}
    </button>
  );
}
