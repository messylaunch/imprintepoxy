"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";

const isVideo = (s: string) => s.endsWith(".mp4");

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="sheen relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-ink-2 ring-1 ring-line md:aspect-[5/6]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={images[i]}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          >
            {isVideo(images[i]) ? (
              <video src={images[i]} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : (
              <img src={images[i]} alt={alt} className="h-full w-full object-cover" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, k) => (
            <button key={src} onClick={() => setI(k)} className={`press h-20 w-20 overflow-hidden rounded-xl ring-2 transition ${k === i ? "ring-red" : "ring-transparent opacity-60"}`}>
              {isVideo(src) ? (
                <span className="relative block h-full w-full">
                  <video src={src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  <Play size={18} className="absolute inset-0 m-auto fill-white text-white drop-shadow" />
                </span>
              ) : (
                <img src={src} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
