import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Hammer, ShieldCheck, Truck, Heart } from "lucide-react";
import { findShop, SHOP } from "@/lib/catalog";
import { money, PRODUCTS } from "@/lib/design";
import { AddToCartButton, BuyNowButton, ShopCard } from "@/components/cards";
import { Gallery } from "@/components/gallery";

export function generateStaticParams() {
  return SHOP.map((s) => ({ slug: s.slug }));
}

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findShop(slug);
  if (!item) notFound();
  const sold = item.status === "sold";
  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
      <Link href="/shop" className="font-tag mb-6 inline-flex items-center gap-2 text-xs text-muted hover:text-fg">
        <ArrowLeft size={14} /> Catalog
      </Link>
      <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12">
        <Gallery images={item.gallery} alt={item.title} />
        <div className="stagger md:sticky md:top-24 md:self-start">
          <p className="text-sm text-muted">{PRODUCTS[item.category].name}</p>
          <h1 className="font-display mt-2 text-4xl md:text-5xl">{item.title}</h1>
          <p className="mt-2 text-sm text-muted">{item.size}</p>
          <p className="font-display mt-6 text-4xl">{money(item.price)}</p>
          <p className="mt-5 text-fg/80">{item.blurb}</p>

          <div className="mt-8 flex flex-col gap-3">
            {sold ? (
              <div className="rounded-2xl bg-gold/10 p-4 text-sm text-gold ring-1 ring-gold/30">This one found its home. We'll make you one just like it with your name, team or photo.</div>
            ) : (
              <div className="flex gap-3">
                <BuyNowButton item={item} />
              </div>
            )}
            <div className="flex gap-3">
              {!sold && <AddToCartButton item={item} />}
              <Link href={`/build/${item.category}?from=${item.slug}`} className={`btn ${sold ? "" : "btn-ghost"} h-14 flex-1`}>
                <Hammer size={16} /> Build one like this
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] text-muted">
            <div className="panel p-3"><ShieldCheck className="mx-auto mb-1 text-fg" size={18} />UV-resistant seal</div>
            <div className="panel p-3"><Truck className="mx-auto mb-1 text-fg" size={18} />Pickup or ship</div>
            <div className="panel p-3"><Heart className="mx-auto mb-1 text-red" size={18} />Supports Imprint</div>
          </div>
        </div>
      </div>
      <h2 className="font-display mt-24 text-3xl">More from the bench</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP.filter((s) => s.slug !== item.slug).slice(0, 3).map((s) => <ShopCard key={s.slug} item={s} />)}
      </div>
    </div>
  );
}
