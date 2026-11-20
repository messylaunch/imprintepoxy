"use client";
import { DesignCanvas } from "./design-canvas";
import type { DesignConfig } from "@/lib/design";

/** Saved thumbnail, or a live render when there isn't one yet. */
export function Thumb({ src, config, className = "h-full w-full", fit = "cover" }: { src?: string | null; config?: DesignConfig | null; className?: string; fit?: "cover" | "contain" }) {
  if (src) return <img src={src} alt="" className={`${className} ${fit === "cover" ? "object-cover" : "object-contain"}`} />;
  if (config) return <DesignCanvas config={config} className={className} maxDpr={1.25} />;
  return <div className={`${className} bg-[repeating-linear-gradient(135deg,#121216_0_10px,#15151a_10px_20px)]`} />;
}
