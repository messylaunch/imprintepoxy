"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";

const isVideo = (s: string) => s.endsWith(".mp4");
const isMockup = (s: string) => s.includes("/gen/") && !isVideo(s);

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-2">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={cur} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
            {isVideo(cur) ? <video src={cur} autoPlay muted loop playsInline className="h-full w-full object-cover" /> : <img src={cur} alt={alt} className="h-full w-full object-cover" />}
          </motion.div>
        </AnimatePresence>
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] text-fg/85 backdrop-blur">{isVideo(cur) ? "Pour video" : isMockup(cur) ? "Room mockup" : "Real photo"}</span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, k) => (
            <button key={src} onClick={() => setI(k)} aria-label={`Image ${k + 1}`} className={`press relative h-16 w-16 overflow-hidden rounded-lg transition-opacity ${k === i ? "opacity-100 ring-1 ring-fg" : "opacity-50 hover:opacity-80"}`}>
              {isVideo(src) ? (
                <>
                  <video src={src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  <Play size={14} className="absolute inset-0 m-auto fill-white text-white" />
                </>
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
