"use client";
import { useEffect, useRef, useState } from "react";
import type { DesignConfig } from "@/lib/design";
import { loadImage, renderDesign } from "@/lib/render";

type Props = {
  config: DesignConfig;
  className?: string;
  interactive?: boolean;
  onTransform?: (t: DesignConfig["transform"]) => void;
  sheen?: number;
  maxDpr?: number;
};

/** Live-rendered product mockup. Interactive mode supports drag, pinch & wheel zoom. */
export function DesignCanvas({ config, className, interactive, onTransform, sheen, maxDpr = 2 }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const surface = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const cfgRef = useRef(config);
  cfgRef.current = config;

  useEffect(() => {
    let live = true;
    if (!config.imageUrl) return setImg(null);
    loadImage(config.imageUrl).then((i) => live && setImg(i)).catch(() => live && setImg(null));
    return () => {
      live = false;
    };
  }, [config.imageUrl]);

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current!;
    if (!size.w || !size.h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const W = Math.round(size.w * dpr), H = Math.round(size.h * dpr);
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    const raf = requestAnimationFrame(() => {
      const S = renderDesign(c, config, img, { sheen });
      surface.current = { x: S.x / dpr, y: S.y / dpr, w: S.w / dpr, h: S.h / dpr };
    });
    return () => cancelAnimationFrame(raf);
  }, [config, img, size, sheen, maxDpr]);

  // ---------- gestures ----------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ t: DesignConfig["transform"]; dist: number; ang: number; cx: number; cy: number } | null>(null);

  const gestureBase = () => {
    const pts = [...pointers.current.values()];
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    let dist = 1, ang = 0;
    if (pts.length >= 2) {
      dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      ang = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
    }
    return { cx, cy, dist, ang };
  };

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    if (pointers.current.size >= 2) return; // ignore extra fingers
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureBase();
    start.current = { t: { ...cfgRef.current.transform }, ...g };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!interactive || !pointers.current.has(e.pointerId) || !start.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureBase();
    const s = start.current;
    const S = surface.current;
    const t = { ...s.t };
    t.x = clamp(s.t.x + (g.cx - s.cx) / S.w, -1.2, 1.2);
    t.y = clamp(s.t.y + (g.cy - s.cy) / S.h, -1.2, 1.2);
    if (pointers.current.size >= 2 && s.dist > 0) {
      t.scale = clamp(s.t.scale * (g.dist / s.dist), 0.3, 5);
      t.rotation = Math.round(s.t.rotation + ((g.ang - s.ang) * 180) / Math.PI);
    }
    onTransform?.(t);
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size) {
      const g = gestureBase();
      start.current = { t: { ...cfgRef.current.transform }, ...g };
    } else start.current = null;
  };

  useEffect(() => {
    const el = wrap.current;
    if (!el || !interactive) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const t = cfgRef.current.transform;
      onTransform?.({ ...t, scale: clamp(t.scale * Math.exp(-e.deltaY * 0.0015), 0.3, 5) });
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [interactive, onTransform]);

  return (
    <div
      ref={wrap}
      className={className}
      style={{ touchAction: interactive ? "none" : undefined, cursor: interactive ? "grab" : undefined }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <canvas ref={canvas} className="block h-full w-full" />
    </div>
  );
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
