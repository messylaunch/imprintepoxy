import { DesignConfig, ProductType, defaultConfig } from "./design";

export type ShopItem = {
  slug: string;
  title: string;
  category: ProductType;
  price: number; // cents
  status: "available" | "sold";
  size: string;
  image: string;
  gallery: string[];
  blurb: string;
  // "Build one like this" starting point
  preset: Partial<DesignConfig>;
};

// Finished pieces (real photos). Add more here as they're made.
export const SHOP: ShopItem[] = [
  {
    slug: "royal-ponds-coffee-table",
    title: "The Royal “Ponds” Table",
    category: "table",
    price: 85000,
    status: "sold",
    size: 'Coffee table · 48" × 24"',
    image: "/media/ponds-table.jpg",
    gallery: ["/media/ponds-table.jpg", "/media/ponds-top.jpg"],
    blurb: "Gold script, crown & diamond heart under a mirror-gloss pour with gold flake. A one-of-one family piece. Want your name like this? Build one.",
    preset: { product: "table", size: "coffee", imageUrl: "/media/ponds-top.jpg", effects: ["sparkle"], flake: "gold", frame: "black" },
  },
  {
    slug: "florida-classic-panel",
    title: "Florida Classic Rivalry Panel",
    category: "wall",
    price: 19500,
    status: "available",
    size: 'Wall art · 18" × 24"',
    image: "/media/florida-classic-shop.jpg",
    gallery: ["/media/florida-classic-shop.jpg", "/media/florida-classic.jpg"],
    blurb: "Game-day energy sealed in glass-clear epoxy with silver shimmer. Ready to hang.",
    preset: { product: "wall", size: "18x24", imageUrl: "/media/florida-classic.jpg", flake: "silver" },
  },
  {
    slug: "wildcats-gold-helmet-panel",
    title: "Wildcats Gold Helmet Panel",
    category: "wall",
    price: 19500,
    status: "available",
    size: 'Wall art · 18" × 24"',
    image: "/media/bcu-shop.jpg",
    gallery: ["/media/bcu-shop.jpg", "/media/bcu-helmet-panel.jpg"],
    blurb: "Maroon & gold helmet art with gold flake throughout. Deep, glossy, loud.",
    preset: { product: "wall", size: "18x24", imageUrl: "/media/bcu-helmet-panel.jpg", flake: "gold" },
  },
  {
    slug: "star-helmet-display",
    title: "Star Helmet Display",
    category: "helmet",
    price: 22500,
    status: "available",
    size: 'Helmet display · 24" wide',
    image: "/media/cowboys-helmet.jpg",
    gallery: ["/media/cowboys-helmet.jpg"],
    blurb: "Helmet-cut wall display with a real facemask look and silver sparkle coat.",
    preset: { product: "helmet", size: "m", imageUrl: "/media/cowboys-helmet.jpg", flake: "silver", frame: "black", transform: { x: 0.02, y: 0.02, scale: 1.12, rotation: 0 } },
  },
];

export type Concept = { slug: string; title: string; blurb: string; config: DesignConfig };

const c = (p: ProductType, o: Partial<DesignConfig>): DesignConfig => ({ ...defaultConfig(p), ...o });

// "Ideas we can make": rendered live from the builder engine.
// Swap in Higgsfield renders later by adding an `image` field.
export const CONCEPTS: Concept[] = [
  { slug: "galaxy-rivalry-table", title: "Galaxy Rivalry Table", blurb: "Your matchup, floating in a nebula.", config: c("table", { size: "coffee", imageUrl: "/media/florida-classic.jpg", effects: ["galaxy", "sparkle"], flake: "holo", filter: "vivid" }) },
  { slug: "chrome-wildcat-helmet", title: "Chrome Mask Helmet", blurb: "Team art cut to a helmet, red neon edge.", config: c("helmet", { size: "l", imageUrl: "/media/bcu-helmet-panel.jpg", effects: ["neon"], frame: "chrome", transform: { x: -0.08, y: 0, scale: 1.25, rotation: 0 } }) },
  { slug: "gold-rush-round", title: "Gold Rush Round", blurb: "Family name in gold leaf, round top.", config: c("table", { size: "round", imageUrl: "/media/ponds-top.jpg", effects: ["goldflake", "vignette"], flake: "gold", frame: "gold", transform: { x: 0, y: 0, scale: 1.05, rotation: 0 } }) },
  { slug: "noir-dining", title: "Midnight Dining", blurb: "Black & silver for the big table.", config: c("table", { size: "dining", imageUrl: "/media/bcu-helmet-panel.jpg", effects: ["glitter"], flake: "silver", filter: "noir", frame: "chrome" }) },
  { slug: "holo-portrait", title: "Holo Portrait Wall", blurb: "Iridescent sheen over any photo.", config: c("wall", { size: "24x36", orientation: "portrait", imageUrl: "/media/florida-classic.jpg", effects: ["holo", "sparkle"], transform: { x: 0, y: 0, scale: 1, rotation: 0 } }) },
  { slug: "inferno-helmet", title: "Inferno Helmet", blurb: "Heat-map filter + candy red flake.", config: c("helmet", { size: "m", imageUrl: "/media/florida-classic.jpg", filter: "inferno", flake: "red", frame: "black", transform: { x: 0.1, y: 0.05, scale: 1.4, rotation: 0 } }) },
];

export const findShop = (slug: string) => SHOP.find((s) => s.slug === slug);
export const findConcept = (slug: string) => CONCEPTS.find((s) => s.slug === slug);
