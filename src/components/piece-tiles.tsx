"use client";
import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { DesignCanvas } from "./design-canvas";
import { defaultConfig, money, PRODUCTS, ProductType } from "@/lib/design";

const previews: Record<ProductType, ReturnType<typeof defaultConfig>> = {
  table: { ...defaultConfig("table"), imageUrl: "/media/ponds-top.jpg", flake: "gold", effects: ["sparkle"] },
  helmet: { ...defaultConfig("helmet"), imageUrl: "/media/cowboys-helmet.jpg", frame: "black", flake: "silver", transform: { x: 0.02, y: 0.02, scale: 1.12, rotation: 0 } },
  wall: { ...defaultConfig("wall"), imageUrl: "/media/florida-classic.jpg", flake: "silver" },
};

export function PieceTiles() {
  const types: ProductType[] = ["table", "helmet", "wall"];
  return (
    <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {types.map((t) => (
        <Link key={t} href={`/build/${t}`} className="press group relative overflow-hidden rounded-[1.4rem] bg-[radial-gradient(100%_80%_at_50%_30%,#22222a,#0c0c0f)] ring-1 ring-line transition-shadow hover:ring-red/50">
          <DesignCanvas config={previews[t]} className="aspect-square w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.05]" maxDpr={1.5} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 md:p-4">
            <h3 className="font-display text-2xl font-extrabold leading-none md:text-3xl">{PRODUCTS[t].name.replace("Custom ", "")}s</h3>
            <p className="mt-1 text-[11px] text-fg/70">From {money(PRODUCTS[t].sizes[0].price)}</p>
          </div>
        </Link>
      ))}
      <Link href="/build/custom" className="press group relative grid aspect-square place-items-center overflow-hidden rounded-[1.4rem] ring-1 ring-dashed ring-white/15" style={{ background: "repeating-linear-gradient(135deg,#0d0d10 0 14px,#111116 14px 28px)" }}>
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full ring-1 ring-red/50 transition-transform duration-300 group-hover:scale-110" style={{ boxShadow: "0 0 30px -6px #ff1f1f" }}>
            <MessageSquarePlus className="text-red" />
          </div>
          <h3 className="font-display text-2xl font-extrabold md:text-3xl">Special Request</h3>
          <p className="mt-1 px-4 text-[11px] text-muted">Upload your pieces, we quote it</p>
        </div>
      </Link>
    </div>
  );
}
