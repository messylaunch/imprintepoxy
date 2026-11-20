"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Zap } from "lucide-react";
import { useCart } from "@/components/providers";
import { money } from "@/lib/design";

export default function Cart() {
  const cart = useCart();
  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 md:px-6">
      <p className="font-tag text-xs text-red">Cart</p>
      <h1 className="font-display mt-2 text-6xl font-black md:text-7xl">
        <span className="chrome-text">Your haul</span>
      </h1>
      {cart.lines.length === 0 ? (
        <div className="panel mt-10 p-10 text-center">
          <ShoppingBag className="mx-auto text-red" size={40} />
          <h2 className="font-display mt-4 text-4xl font-black">Cart's empty</h2>
          <p className="mt-2 text-sm text-muted">Your projects are saved separately, so you can add the one you love when you're ready.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/shop" className="btn btn-ghost">Shop</Link>
            <Link href="/build" className="btn">Build your own</Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {cart.lines.map((l) => (
                <motion.div key={l.id} layout exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }} className="panel flex gap-4 p-3">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-3">{l.thumb && <img src={l.thumb} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-tag text-[0.6rem] text-red">{l.kind === "design" ? "Custom build" : "Finished piece"}</p>
                        <h3 className="font-display truncate text-2xl font-extrabold leading-none">{l.title}</h3>
                      </div>
                      <button onClick={() => cart.remove(l.id)} className="press text-muted hover:text-red" aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{l.details?.join(" · ")}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
                        <button className="press grid h-7 w-7 place-items-center rounded-full hover:bg-white/10" onClick={() => cart.setQty(l.id, l.qty - 1)} aria-label="Less"><Minus size={13} /></button>
                        <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                        <button className="press grid h-7 w-7 place-items-center rounded-full hover:bg-white/10" onClick={() => cart.setQty(l.id, l.qty + 1)} aria-label="More"><Plus size={13} /></button>
                      </div>
                      <span className="font-display text-2xl font-black">{money(l.price * l.qty)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="panel h-fit p-5 md:sticky md:top-24">
            <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{money(cart.subtotal)}</span></div>
            <p className="mt-1 text-xs text-muted">Tax & shipping at checkout. Local pickup is free.</p>
            <Link href="/checkout" className="btn mt-5 h-14 w-full"><Zap size={16} /> Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
