"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="sheen relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-ink-2 ring-1 ring-line md:aspect-[5/6]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={images[i]}
            src={images[i]}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, k) => (
            <button key={src} onClick={() => setI(k)} className={`press h-20 w-20 overflow-hidden rounded-xl ring-2 transition ${k === i ? "ring-red" : "ring-transparent opacity-60"}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
