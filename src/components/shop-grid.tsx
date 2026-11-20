"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHOP } from "@/lib/catalog";
import { ShopCard } from "./cards";

const tabs = [
  { id: "all", label: "All" },
  { id: "table", label: "Tables" },
  { id: "helmet", label: "Helmets" },
  { id: "wall", label: "Wall Art" },
];

export function ShopGrid() {
  const [tab, setTab] = useState("all");
  const items = SHOP.filter((s) => tab === "all" || s.category === tab);
  return (
    <>
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="press relative shrink-0 rounded-full px-5 py-2.5 font-tag text-xs">
            {tab === t.id && <motion.span layoutId="shop-tab" className="absolute inset-0 rounded-full" style={{ background: "var(--candy)" }} transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((s) => (
            <motion.div key={s.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }} transition={{ type: "spring", duration: 0.45, bounce: 0.1 }}>
              <ShopCard item={s} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
