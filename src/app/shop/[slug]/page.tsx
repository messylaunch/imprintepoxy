import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { findShop, SHOP } from "@/lib/catalog";
import { money } from "@/lib/design";
import { AddToCartButton, BuyNowButton, ShopCard } from "@/components/cards";
import { Gallery } from "@/components/gallery";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return SHOP.map((s) => ({ slug: s.slug }));
}

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = findShop(slug);
  if (!item) notFound();
  const sold = item.status === "sold";
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24 md:px-8">
      <Link href="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={15} /> Shop
      </Link>
      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <Gallery images={item.gallery} alt={item.title} />
        <div className="md:sticky md:top-24 md:self-start md:pt-4">
          <h1 className="font-display text-4xl md:text-5xl">{item.title}</h1>
          <p className="mt-2 text-muted">{item.size}</p>
          <p className="mt-6 text-2xl">{money(item.price)}</p>
          <p className="mt-6 max-w-md leading-relaxed text-fg/80">{item.blurb}</p>

          <div className="mt-8 flex max-w-md flex-col gap-3">
            {sold ? (
              <>
                <p className="text-sm text-muted">This one has found its home. We&apos;ll make you one like it with your name, team or photo.</p>
                <Link href={`/build/${item.category}?from=${item.slug}`} className="btn h-14">Make one like it</Link>
              </>
            ) : (
              <>
                <BuyNowButton item={item} />
                <AddToCartButton item={item} />
                <Link href={`/build/${item.category}?from=${item.slug}`} className="mt-1 text-center text-sm text-fg/70 underline-offset-4 hover:text-fg hover:underline">
                  Or customize it with your own photo
                </Link>
              </>
            )}
          </div>

          <ul className="mt-10 max-w-md space-y-2 border-t border-line pt-6 text-sm text-muted">
            <li>Hand-poured, high-gloss epoxy finish</li>
            <li>Local pickup or insured shipping</li>
            <li>Questions? Call or text <a href={site.phoneHref} className="text-fg hover:underline">{site.phone}</a></li>
          </ul>
        </div>
      </div>
      <h2 className="font-display mt-28 text-3xl">More pieces</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
        {SHOP.filter((s) => s.slug !== item.slug).slice(0, 3).map((s) => <ShopCard key={s.slug} item={s} />)}
      </div>
    </div>
  );
}
