"use client";
// Canvas renderer: draws a DesignConfig as a product mockup.
// Used for live builder preview, display mode, concept cards, thumbnails & exports.
import { DesignConfig, FILTERS, FLAKES, FRAMES, getSize, surfaceAspect } from "./design";

type Rect = { x: number; y: number; w: number; h: number };

// ---------- helpers ----------
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const imgCache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(url: string): Promise<HTMLImageElement> {
  let p = imgCache.get(url);
  if (!p) {
    p = new Promise((res, rej) => {
      const i = new Image();
      i.decoding = "async";
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    imgCache.set(url, p);
    p.catch(() => imgCache.delete(url));
  }
  return p;
}

// Helmet silhouette (facing right), normalized to a 1 x 1 box (scaled to w,h).
function helmetShell(ctx: CanvasRenderingContext2D | Path2D, r: Rect) {
  const X = (v: number) => r.x + v * r.w;
  const Y = (v: number) => r.y + v * r.h;
  ctx.moveTo(X(0.1), Y(0.8));
  ctx.bezierCurveTo(X(-0.01), Y(0.55), X(0.04), Y(0.12), X(0.4), Y(0.045));
  ctx.bezierCurveTo(X(0.66), Y(-0.01), X(0.86), Y(0.14), X(0.875), Y(0.4));
  ctx.lineTo(X(0.79), Y(0.43));
  ctx.bezierCurveTo(X(0.75), Y(0.5), X(0.735), Y(0.61), X(0.755), Y(0.71));
  ctx.lineTo(X(0.66), Y(0.85));
  ctx.bezierCurveTo(X(0.5), Y(0.9), X(0.32), Y(0.865), X(0.24), Y(0.82));
  ctx.bezierCurveTo(X(0.18), Y(0.845), X(0.13), Y(0.845), X(0.1), Y(0.8));
  ctx.closePath();
}

function shapePath(cfg: DesignConfig, r: Rect): Path2D {
  const p = new Path2D();
  const s = getSize(cfg);
  if (cfg.product === "helmet") {
    helmetShell(p, r);
  } else if (s.shape === "round") {
    p.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
  } else {
    const rad = Math.min(r.w, r.h) * (cfg.product === "table" ? 0.025 : 0.012);
    p.roundRect(r.x, r.y, r.w, r.h, rad);
  }
  return p;
}

function expand(r: Rect, e: number): Rect {
  return { x: r.x - e, y: r.y - e, w: r.w + e * 2, h: r.h + e * 2 };
}

// ---------- cached effect layers ----------
const layerCache = new Map<string, HTMLCanvasElement>();
function layer(key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const k = `${key}|${Math.round(w)}x${Math.round(h)}`;
  let c = layerCache.get(k);
  if (!c) {
    c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    draw(c.getContext("2d")!, c.width, c.height);
    if (layerCache.size > 60) layerCache.clear();
    layerCache.set(k, c);
  }
  return c;
}

function star(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const g = c.createRadialGradient(x, y, 0, x, y, r * 1.6);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.15, color);
  g.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r * 1.6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.95)";
  c.beginPath();
  const t = r * 0.09;
  c.moveTo(x, y - r * 2.2);
  c.quadraticCurveTo(x + t, y - t, x + r * 2.2, y);
  c.quadraticCurveTo(x + t, y + t, x, y + r * 2.2);
  c.quadraticCurveTo(x - t, y + t, x - r * 2.2, y);
  c.quadraticCurveTo(x - t, y - t, x, y - r * 2.2);
  c.fill();
}

const EFFECT_LAYERS: Record<string, { op: GlobalCompositeOperation; draw: (c: CanvasRenderingContext2D, w: number, h: number) => void }> = {
  sparkle: {
    op: "lighter",
    draw(c, w, h) {
      const r = rng(7);
      const m = Math.min(w, h);
      for (let i = 0; i < 34; i++) {
        const big = r() < 0.25;
        star(c, r() * w, r() * h, m * (big ? 0.02 + r() * 0.025 : 0.006 + r() * 0.01), r() < 0.5 ? "rgba(255,214,120,0.55)" : "rgba(255,255,255,0.5)");
      }
    },
  },
  glitter: {
    op: "lighter",
    draw(c, w, h) {
      const r = rng(11);
      const n = Math.min(5000, (w * h) / 140);
      const d = Math.max(0.6, Math.min(w, h) / 700);
      for (let i = 0; i < n; i++) {
        const a = r();
        c.fillStyle = `rgba(255,255,255,${0.15 + a * a * 0.85})`;
        const s = d * (0.5 + r() * 1.3);
        c.fillRect(r() * w, r() * h, s, s);
      }
    },
  },
  goldflake: {
    op: "source-over",
    draw(c, w, h) {
      const r = rng(23);
      const m = Math.min(w, h);
      for (let i = 0; i < 120; i++) {
        const x = r() * w, y = r() * h, s = m * (0.006 + r() * r() * 0.03);
        const g = c.createLinearGradient(x - s, y - s, x + s, y + s);
        g.addColorStop(0, "#fff1b8");
        g.addColorStop(0.5, "#e6ac2c");
        g.addColorStop(1, "#8a5a00");
        c.fillStyle = g;
        c.globalAlpha = 0.65 + r() * 0.35;
        c.beginPath();
        const pts = 5 + Math.floor(r() * 3);
        for (let k = 0; k < pts; k++) {
          const ang = (k / pts) * Math.PI * 2 + r() * 0.5;
          const rr = s * (0.5 + r() * 0.7);
          const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr;
          k ? c.lineTo(px, py) : c.moveTo(px, py);
        }
        c.fill();
      }
      c.globalAlpha = 1;
    },
  },
  galaxy: {
    op: "screen",
    draw(c, w, h) {
      const r = rng(31);
      const cols = ["rgba(120,40,255,", "rgba(255,30,90,", "rgba(30,140,255,", "rgba(255,60,200,"];
      for (let i = 0; i < 6; i++) {
        const x = r() * w, y = r() * h, rad = Math.max(w, h) * (0.25 + r() * 0.35);
        const g = c.createRadialGradient(x, y, 0, x, y, rad);
        const col = cols[i % cols.length];
        g.addColorStop(0, col + "0.55)");
        g.addColorStop(1, col + "0)");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      }
      for (let i = 0; i < 260; i++) {
        c.fillStyle = `rgba(255,255,255,${r()})`;
        const s = r() * 1.8 + 0.4;
        c.fillRect(r() * w, r() * h, s, s);
      }
    },
  },
  holo: {
    op: "overlay",
    draw(c, w, h) {
      const g = c.createLinearGradient(0, 0, w, h);
      ["#ff5ef7", "#5ef1ff", "#fff35e", "#7bff5e", "#ff5e8a", "#5e8bff"].forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col));
      c.globalAlpha = 0.6;
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    },
  },
  vignette: {
    op: "multiply",
    draw(c, w, h) {
      const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(0,0,0,1)");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    },
  },
};

function flakeLayer(id: string, w: number, h: number) {
  const f = FLAKES.find((x) => x.id === id);
  if (!f || !f.color.length) return null;
  return layer(`flake-${id}`, w, h, (c, W, H) => {
    const r = rng(41);
    const n = Math.min(3500, (W * H) / 260);
    const d = Math.max(0.8, Math.min(W, H) / 520);
    for (let i = 0; i < n; i++) {
      c.fillStyle = f.color[Math.floor(r() * f.color.length)];
      c.globalAlpha = 0.25 + r() * 0.75;
      const s = d * (0.6 + r() * 1.8);
      c.save();
      c.translate(r() * W, r() * H);
      c.rotate(r() * Math.PI);
      c.fillRect(-s / 2, -s / 2, s, s * (0.5 + r()));
      c.restore();
    }
  });
}


// ---------- filters (pixel-based, so they work in every browser incl. iOS Safari) ----------
type M = number[]; // 4x5 color matrix, row-major (r,g,b,a,offset) — alpha row omitted (always identity)
const ID: M = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
function mul(a: M, b: M): M {
  // returns a∘b (apply b first, then a); 3x4 affine matrices
  const o: M = new Array(12).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c];
    o[r * 4 + 3] = a[r * 4] * b[3] + a[r * 4 + 1] * b[7] + a[r * 4 + 2] * b[11] + a[r * 4 + 3];
  }
  return o;
}
function saturateM(s: number): M {
  return [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0, 0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0, 0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0];
}
function sepiaM(a: number): M {
  const k = 1 - a;
  return [0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k, 0, 0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k, 0, 0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k, 0];
}
function hueM(deg: number): M {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283, 0,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0,
  ];
}
const brightM = (b: number): M => [b, 0, 0, 0, 0, b, 0, 0, 0, 0, b, 0];
const contrastM = (c: number): M => { const o = (0.5 - 0.5 * c) * 255; return [c, 0, 0, o, 0, c, 0, o, 0, 0, c, o]; };

function cssToMatrix(css: string): M | null {
  if (!css || css === "none") return null;
  let m = ID;
  for (const [, fn, raw] of css.matchAll(/([a-z-]+)\(([^)]+)\)/g)) {
    const v = parseFloat(raw);
    const step =
      fn === "saturate" ? saturateM(v) :
      fn === "grayscale" ? saturateM(1 - v) :
      fn === "sepia" ? sepiaM(v) :
      fn === "hue-rotate" ? hueM(v) :
      fn === "brightness" ? brightM(v) :
      fn === "contrast" ? contrastM(v) : ID;
    m = mul(step, m);
  }
  return m;
}

const filterCache = new Map<string, HTMLCanvasElement>();
function filteredSource(img: HTMLImageElement, filterId: string): { src: CanvasImageSource; width: number; height: number } {
  const f = FILTERS.find((x) => x.id === filterId);
  const m = f ? cssToMatrix(f.css) : null;
  if (!m) return { src: img, width: img.naturalWidth, height: img.naturalHeight };
  const key = img.src + "|" + filterId;
  let c = filterCache.get(key);
  if (!c) {
    const max = 1800;
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * k));
    c.height = Math.max(1, Math.round(img.naturalHeight * k));
    const x = c.getContext("2d", { willReadFrequently: true })!;
    x.drawImage(img, 0, 0, c.width, c.height);
    try {
      const d = x.getImageData(0, 0, c.width, c.height);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i], g = p[i + 1], b = p[i + 2];
        p[i] = m[0] * r + m[1] * g + m[2] * b + m[3];
        p[i + 1] = m[4] * r + m[5] * g + m[6] * b + m[7];
        p[i + 2] = m[8] * r + m[9] * g + m[10] * b + m[11];
      }
      x.putImageData(d, 0, 0);
    } catch {
      /* cross-origin image: fall back to unfiltered */
    }
    if (filterCache.size > 24) filterCache.clear();
    filterCache.set(key, c);
  }
  return { src: c, width: c.width, height: c.height };
}

// ---------- main ----------
export type RenderOpts = { sheen?: number; background?: string | null };

export function renderDesign(canvas: HTMLCanvasElement, cfg: DesignConfig, img: HTMLImageElement | null, opts: RenderOpts = {}): Rect {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, W, H);
  }

  const aspect = surfaceAspect(cfg);
  const pad = Math.min(W, H) * (cfg.product === "helmet" ? 0.05 : 0.08);
  let sw = W - pad * 2, sh = sw / aspect;
  if (sh > H - pad * 2) { sh = H - pad * 2; sw = sh * aspect; }
  const S: Rect = { x: (W - sw) / 2, y: (H - sh) / 2 - (cfg.product === "helmet" ? 0 : pad * 0.15), w: sw, h: sh };
  const m = Math.min(sw, sh);
  const frame = FRAMES.find((f) => f.id === cfg.frame) ?? FRAMES[0];
  const shape = shapePath(cfg, S);

  // --- body / base ---
  ctx.save();
  if (cfg.product === "table") {
    const e = m * 0.028;
    const outer = shapePath(cfg, expand(S, e));
    const lip = shapePath(cfg, { ...expand(S, e), y: S.y - e + m * 0.035 });
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = m * 0.12;
    ctx.shadowOffsetY = m * 0.06;
    ctx.fillStyle = shade(frame.color, -0.45);
    ctx.fill(lip);
    ctx.shadowColor = "transparent";
    const g = ctx.createLinearGradient(S.x, S.y - e, S.x + S.w, S.y + S.h + e);
    g.addColorStop(0, frame.shine);
    g.addColorStop(0.35, frame.color);
    g.addColorStop(0.65, shade(frame.color, -0.25));
    g.addColorStop(1, frame.shine);
    ctx.fillStyle = g;
    ctx.fill(outer);
  } else if (cfg.product === "wall") {
    const d = m * 0.025;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = m * 0.1;
    ctx.shadowOffsetX = m * 0.03;
    ctx.shadowOffsetY = m * 0.05;
    ctx.fillStyle = shade(frame.color, -0.4);
    ctx.fill(shapePath(cfg, { ...S, x: S.x + d * 0.6, y: S.y + d }));
    ctx.shadowColor = "transparent";
    ctx.fillStyle = frame.color;
    ctx.fill(shapePath(cfg, expand(S, m * 0.008)));
  } else {
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = m * 0.1;
    ctx.shadowOffsetY = m * 0.05;
    ctx.fillStyle = "#111";
    ctx.fill(shape);
  }
  ctx.restore();

  // --- printed surface ---
  ctx.save();
  ctx.clip(shape);
  drawPrint(ctx, cfg, img, S, shape, m);

  // --- topcoat ---
  topcoat(ctx, cfg.topcoat, S, opts.sheen ?? 0.32);
  ctx.restore();

  // --- domed edge highlight ---
  if (cfg.topcoat === "gloss" || cfg.topcoat === "satin") {
    ctx.save();
    ctx.clip(shape);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = m * 0.008;
    ctx.translate(m * 0.003, m * 0.003);
    ctx.stroke(shape);
    ctx.restore();
  }

  if (cfg.product === "helmet") helmetHardware(ctx, S, frame);
  return S;
}


/** The printed artwork only (image, filter, overlay, flake), already clipped by the caller. */
function drawPrint(ctx: CanvasRenderingContext2D, cfg: DesignConfig, img: HTMLImageElement | null, S: Rect, shape: Path2D, m: number) {
  ctx.fillStyle = "#121216";
  ctx.fillRect(S.x, S.y, S.w, S.h);
  if (img) {
    const t = cfg.transform;
    const { src, width: iw, height: ih } = filteredSource(img, cfg.filter);
    const base = Math.max(S.w / iw, S.h / ih);
    const sc = base * t.scale;
    ctx.save();
    ctx.translate(S.x + S.w / 2 + t.x * S.w, S.y + S.h / 2 + t.y * S.h);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.drawImage(src, (-iw * sc) / 2, (-ih * sc) / 2, iw * sc, ih * sc);
    ctx.restore();
  } else {
    placeholder(ctx, S);
  }

  for (const id of cfg.effects) {
    if (id === "neon") continue;
    const L = EFFECT_LAYERS[id];
    if (!L) continue;
    ctx.globalCompositeOperation = L.op;
    ctx.drawImage(layer(id, S.w, S.h, L.draw), S.x, S.y, S.w, S.h);
  }
  ctx.globalCompositeOperation = "source-over";

  const fl = flakeLayer(cfg.flake, S.w, S.h);
  if (fl) {
    ctx.globalCompositeOperation = cfg.flake === "red" ? "source-over" : "lighter";
    ctx.drawImage(fl, S.x, S.y, S.w, S.h);
    ctx.globalCompositeOperation = "source-over";
  }

  if (cfg.effects.includes("neon")) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,40,40,0.95)";
    ctx.lineWidth = m * 0.02;
    ctx.shadowColor = "#ff1a1a";
    ctx.shadowBlur = m * 0.08;
    ctx.stroke(shape);
    ctx.stroke(shape);
    ctx.restore();
  }

}

/** Flat texture of the printed surface for the 3D mockup (no frame, no fake gloss). */
export function renderPrintTexture(cfg: DesignConfig, img: HTMLImageElement | null, px = 1600): HTMLCanvasElement {
  const a = surfaceAspect(cfg);
  const c = document.createElement("canvas");
  c.width = a >= 1 ? px : Math.round(px * a);
  c.height = a >= 1 ? Math.round(px / a) : px;
  const ctx = c.getContext("2d")!;
  const S: Rect = { x: 0, y: 0, w: c.width, h: c.height };
  const shape = shapePath(cfg, S);
  ctx.save();
  ctx.clip(shape);
  drawPrint(ctx, cfg, img, S, shape, Math.min(S.w, S.h));
  ctx.restore();
  return c;
}

function topcoat(ctx: CanvasRenderingContext2D, kind: string, S: Rect, pos: number) {
  if (kind === "none" || !kind) return;
  ctx.globalCompositeOperation = "screen";
  if (kind === "gloss") {
    const cx = S.x + S.w * pos * 1.6 - S.w * 0.3;
    const g = ctx.createLinearGradient(cx - S.w * 0.3, S.y, cx + S.w * 0.3, S.y + S.h);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.42, "rgba(255,255,255,0.06)");
    g.addColorStop(0.5, "rgba(255,255,255,0.32)");
    g.addColorStop(0.53, "rgba(255,255,255,0.1)");
    g.addColorStop(0.62, "rgba(255,255,255,0.03)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(S.x, S.y, S.w, S.h);
    const r = ctx.createRadialGradient(S.x + S.w * 0.2, S.y + S.h * 0.12, 0, S.x + S.w * 0.2, S.y + S.h * 0.12, Math.max(S.w, S.h) * 0.5);
    r.addColorStop(0, "rgba(255,255,255,0.16)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = r;
    ctx.fillRect(S.x, S.y, S.w, S.h);
  } else if (kind === "satin") {
    const g = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h);
    g.addColorStop(0, "rgba(255,255,255,0.1)");
    g.addColorStop(0.5, "rgba(255,255,255,0.03)");
    g.addColorStop(1, "rgba(255,255,255,0.08)");
    ctx.fillStyle = g;
    ctx.fillRect(S.x, S.y, S.w, S.h);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.045)";
    ctx.fillRect(S.x, S.y, S.w, S.h);
  }
  ctx.globalCompositeOperation = "source-over";
}

function helmetHardware(ctx: CanvasRenderingContext2D, r: Rect, frame: { color: string; shine: string }) {
  const X = (v: number) => r.x + v * r.w;
  const Y = (v: number) => r.y + v * r.h;
  const m = Math.min(r.w, r.h);
  // ear hole
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  ctx.ellipse(X(0.47), Y(0.6), m * 0.045, m * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = m * 0.006;
  ctx.stroke();
  ctx.restore();

  // facemask bars
  const bars: [number, number, number, number, number, number][] = [
    [0.78, 0.45, 0.93, 0.44, 0.99, 0.56],
    [0.99, 0.56, 1.0, 0.75, 0.95, 0.93],
    [0.95, 0.93, 0.82, 0.95, 0.66, 0.86],
    [0.75, 0.64, 0.88, 0.62, 0.995, 0.7],
    [0.885, 0.49, 0.9, 0.7, 0.86, 0.93],
  ];
  const draw = (w: number, style: string | CanvasGradient) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    for (const [a, b, c, d, e, f] of bars) {
      ctx.beginPath();
      ctx.moveTo(X(a), Y(b));
      ctx.quadraticCurveTo(X(c), Y(d), X(e), Y(f));
      ctx.stroke();
    }
  };
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = m * 0.03;
  ctx.shadowOffsetY = m * 0.015;
  draw(m * 0.042, shade(frame.color, -0.5));
  ctx.restore();
  const g = ctx.createLinearGradient(X(0.75), Y(0.4), X(1), Y(0.95));
  g.addColorStop(0, frame.shine);
  g.addColorStop(0.4, frame.color);
  g.addColorStop(0.7, shade(frame.color, -0.3));
  g.addColorStop(1, frame.shine);
  draw(m * 0.03, g);
  draw(m * 0.008, "rgba(255,255,255,0.45)");

  // screws / clips
  for (const [sx, sy] of [[0.79, 0.455], [0.7, 0.82]]) {
    ctx.fillStyle = "#cfd3d8";
    ctx.beginPath();
    ctx.arc(X(sx), Y(sy), m * 0.022, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b7078";
    ctx.beginPath();
    ctx.arc(X(sx), Y(sy), m * 0.009, 0, Math.PI * 2);
    ctx.fill();
  }
}

function placeholder(ctx: CanvasRenderingContext2D, S: Rect) {
  const g = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h);
  g.addColorStop(0, "#1b0b0d");
  g.addColorStop(0.5, "#2a0a0e");
  g.addColorStop(1, "#0e0e12");
  ctx.fillStyle = g;
  ctx.fillRect(S.x, S.y, S.w, S.h);
  ctx.strokeStyle = "rgba(255,40,40,0.12)";
  ctx.lineWidth = 2;
  const step = Math.max(14, S.w / 22);
  for (let i = -S.h; i < S.w; i += step) {
    ctx.beginPath();
    ctx.moveTo(S.x + i, S.y + S.h);
    ctx.lineTo(S.x + i + S.h, S.y);
    ctx.stroke();
  }
  const fs = Math.max(12, Math.min(S.w, S.h) * 0.075);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `700 ${fs}px "Big Shoulders Display", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("YOUR IMAGE HERE", S.x + S.w / 2, S.y + S.h / 2);
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  r = f(r); g = f(g); b = f(b);
  return `rgb(${r},${g},${b})`;
}

/** Render to an offscreen canvas and return a data URL / blob. */
export async function exportDesign(cfg: DesignConfig, size = 1600, type = "image/png", quality = 0.9, background: string | null = "#0b0b0d"): Promise<{ url: string; blob: Blob }> {
  const c = document.createElement("canvas");
  const a = surfaceAspect(cfg);
  c.width = size;
  c.height = Math.round(size / Math.max(1, Math.min(a * 1.05, 1.6)));
  const img = cfg.imageUrl ? await loadImage(cfg.imageUrl).catch(() => null) : null;
  renderDesign(c, cfg, img, { background });
  const url = c.toDataURL(type, quality);
  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), type, quality));
  return { url, blob };
}
