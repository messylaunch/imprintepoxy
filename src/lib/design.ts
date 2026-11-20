// Everything a customer can choose in the builder, plus pricing.
// All prices are placeholders, in cents. Edit freely.

export type ProductType = "table" | "helmet" | "wall";

export type DesignConfig = {
  product: ProductType;
  size: string;
  orientation?: "landscape" | "portrait";
  imageUrl: string | null;
  uploadId?: string | null;
  transform: { x: number; y: number; scale: number; rotation: number };
  filter: string;
  effects: string[];
  topcoat: string;
  flake: string;
  frame: string;
};

export type SizeOption = {
  id: string;
  label: string;
  dims: string;
  w: number; // inches
  h: number;
  shape?: "rect" | "round";
  price: number;
};

export const PRODUCTS: Record<
  ProductType,
  { name: string; tagline: string; sizes: SizeOption[]; frameLabel: string; flakePrice: number }
> = {
  table: {
    name: "Custom Table",
    tagline: "Your image under a glass-deep pour",
    frameLabel: "Base & edge",
    flakePrice: 7500,
    sizes: [
      { id: "end", label: "End Table", dims: '24" × 24"', w: 24, h: 24, price: 45000 },
      { id: "coffee", label: "Coffee Table", dims: '48" × 24"', w: 48, h: 24, price: 85000 },
      { id: "round", label: "Round Table", dims: '36" round', w: 36, h: 36, shape: "round", price: 75000 },
      { id: "dining", label: "Dining Table", dims: '72" × 36"', w: 72, h: 36, price: 185000 },
    ],
  },
  helmet: {
    name: "Helmet Display",
    tagline: "Cut, printed & sealed wall helmet",
    frameLabel: "Facemask",
    flakePrice: 2500,
    sizes: [
      { id: "s", label: "Small", dims: '18" wide', w: 18, h: 15.6, price: 15000 },
      { id: "m", label: "Medium", dims: '24" wide', w: 24, h: 20.8, price: 22500 },
      { id: "l", label: "Large", dims: '32" wide', w: 32, h: 27.8, price: 32500 },
    ],
  },
  wall: {
    name: "Wall Art",
    tagline: "Gallery panels with a mirror finish",
    frameLabel: "Edge",
    flakePrice: 2500,
    sizes: [
      { id: "12x16", label: "Small", dims: '12" × 16"', w: 16, h: 12, price: 12000 },
      { id: "18x24", label: "Medium", dims: '18" × 24"', w: 24, h: 18, price: 19500 },
      { id: "24x36", label: "Large", dims: '24" × 36"', w: 36, h: 24, price: 29500 },
      { id: "36x48", label: "Statement", dims: '36" × 48"', w: 48, h: 36, price: 45000 },
    ],
  },
};

export const FILTERS: { id: string; label: string; css: string }[] = [
  { id: "none", label: "Original", css: "none" },
  { id: "vivid", label: "Vivid", css: "saturate(1.45) contrast(1.08)" },
  { id: "punch", label: "Punch", css: "contrast(1.35) saturate(1.25) brightness(1.02)" },
  { id: "noir", label: "Noir", css: "grayscale(1) contrast(1.25)" },
  { id: "chrome", label: "Chrome", css: "grayscale(1) contrast(1.6) brightness(1.15)" },
  { id: "warm", label: "Sunset", css: "sepia(0.35) saturate(1.4) hue-rotate(-8deg)" },
  { id: "cool", label: "Ice", css: "saturate(1.2) hue-rotate(-18deg) brightness(1.05)" },
  { id: "vintage", label: "Vintage", css: "sepia(0.55) contrast(0.92) brightness(1.06)" },
  { id: "fade", label: "Fade", css: "contrast(0.82) brightness(1.12) saturate(0.8)" },
  { id: "inferno", label: "Inferno", css: "sepia(1) saturate(3.2) hue-rotate(-28deg) contrast(1.1)" },
];

export const EFFECTS: { id: string; label: string; hint: string }[] = [
  { id: "sparkle", label: "Sparkles", hint: "Star bursts" },
  { id: "glitter", label: "Glitter", hint: "Fine shimmer" },
  { id: "goldflake", label: "Gold Leaf", hint: "Metal flakes" },
  { id: "galaxy", label: "Galaxy", hint: "Nebula glow" },
  { id: "holo", label: "Holo", hint: "Rainbow sheen" },
  { id: "neon", label: "Red Neon", hint: "Glowing edge" },
  { id: "vignette", label: "Shadow", hint: "Dark edges" },
];

export const TOPCOATS: { id: string; label: string; hint: string }[] = [
  { id: "gloss", label: "Mirror Gloss", hint: "Glass-deep shine" },
  { id: "satin", label: "Satin", hint: "Soft glow, fewer glares" },
  { id: "matte", label: "Matte", hint: "No reflections" },
];

export const FLAKES: { id: string; label: string; color: string[] }[] = [
  { id: "none", label: "Clear", color: [] },
  { id: "silver", label: "Silver", color: ["#ffffff", "#d7dce2", "#9aa3ad"] },
  { id: "gold", label: "Gold", color: ["#fff1b8", "#f5c542", "#c98a14"] },
  { id: "red", label: "Candy Red", color: ["#ff8a8a", "#e5242b", "#a30000"] },
  { id: "holo", label: "Holographic", color: ["#7cf7ff", "#ff7cf2", "#fff27c", "#8cff7c"] },
];

export const FRAMES: { id: string; label: string; color: string; shine: string }[] = [
  { id: "black", label: "Gloss Black", color: "#0b0b0d", shine: "#3a3a40" },
  { id: "chrome", label: "Chrome", color: "#9ea4ab", shine: "#ffffff" },
  { id: "gold", label: "Gold", color: "#b8860b", shine: "#ffe08a" },
  { id: "red", label: "Candy Red", color: "#b00000", shine: "#ff5a5a" },
  { id: "white", label: "White", color: "#e9e9ec", shine: "#ffffff" },
];

export function defaultConfig(product: ProductType): DesignConfig {
  const size = product === "table" ? "coffee" : product === "helmet" ? "m" : "18x24";
  return {
    product,
    size,
    orientation: "landscape",
    imageUrl: null,
    uploadId: null,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    filter: "none",
    effects: [],
    topcoat: "gloss",
    flake: "none",
    frame: product === "helmet" ? "chrome" : "black",
  };
}

export function getSize(cfg: Pick<DesignConfig, "product" | "size">): SizeOption {
  const p = PRODUCTS[cfg.product];
  return p.sizes.find((s) => s.id === cfg.size) ?? p.sizes[0];
}

/** Surface aspect ratio (width / height) of the printable area. */
export function surfaceAspect(cfg: DesignConfig): number {
  const s = getSize(cfg);
  if (cfg.product === "helmet") return 1.16;
  if (s.shape === "round") return 1;
  const a = s.w / s.h;
  if (cfg.product === "wall" && cfg.orientation === "portrait") return 1 / a;
  return a;
}

export function priceOf(cfg: DesignConfig): number {
  const s = getSize(cfg);
  let p = s.price;
  if (cfg.flake !== "none") p += PRODUCTS[cfg.product].flakePrice;
  return p;
}

export function money(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  });
}

export function describe(cfg: DesignConfig): string[] {
  const s = getSize(cfg);
  const out = [`${s.label} · ${s.dims}`];
  if (cfg.product === "wall") out.push(cfg.orientation === "portrait" ? "Portrait" : "Landscape");
  out.push(TOPCOATS.find((t) => t.id === cfg.topcoat)?.label ?? cfg.topcoat);
  if (cfg.flake !== "none") out.push(`${FLAKES.find((f) => f.id === cfg.flake)?.label} flake`);
  const fx = cfg.effects.map((e) => EFFECTS.find((x) => x.id === e)?.label).filter(Boolean);
  if (fx.length) out.push(fx.join(" + "));
  if (cfg.filter !== "none") out.push(`${FILTERS.find((f) => f.id === cfg.filter)?.label} filter`);
  out.push(`${PRODUCTS[cfg.product].frameLabel}: ${FRAMES.find((f) => f.id === cfg.frame)?.label}`);
  return out;
}

export function parseConfig(json: string): DesignConfig {
  const c = JSON.parse(json);
  return { ...defaultConfig(c.product ?? "table"), ...c };
}
