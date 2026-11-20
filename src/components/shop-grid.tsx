"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHOP } from "@/lib/catalog";
import { ShopCard } from "./cards";

const tabs = [
  { id: "all", label: "All" },
  { id: "table", label: "Tables" },
  { id: "helmet", label: "Helmet displays" },
  { id: "wall", label: "Wall art" },
];

export function ShopGrid() {
  const [tab, setTab] = useState("all");
  const items = SHOP.filter((s) => tab === "all" || s.category === tab);
  return (
    <>
      <div className="no-scrollbar mb-8 flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`relative shrink-0 pb-3 text-sm transition-colors ${tab === t.id ? "text-fg" : "text-muted hover:text-fg"}`}>
            {t.label}
            {tab === t.id && <motion.span layoutId="shop-tab" className="absolute inset-x-0 -bottom-px h-px bg-fg" transition={{ type: "spring", duration: 0.35, bounce: 0.1 }} />}
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((s) => (
            <motion.div key={s.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.25 }}>
              <ShopCard item={s} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
