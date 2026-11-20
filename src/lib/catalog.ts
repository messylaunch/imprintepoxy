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
    gallery: ["/media/ponds-table.jpg", "/media/gen/hero-pour.mp4", "/media/gen/macro-flake.webp", "/media/ponds-top.jpg"],
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
    gallery: ["/media/florida-classic-shop.jpg", "/media/gen/broll-rivalry-panel.mp4", "/media/florida-classic.jpg"],
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
    gallery: ["/media/bcu-shop.jpg", "/media/gen/broll-helmet-panel.mp4", "/media/bcu-helmet-panel.jpg"],
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

export type Concept = { slug: string; title: string; blurb: string; config: DesignConfig; image?: string };

const c = (p: ProductType, o: Partial<DesignConfig>): DesignConfig => ({ ...defaultConfig(p), ...o });

// "Ideas we can make": photoreal concept renders (Higgsfield) of what each build could look like.
// Tapping one opens the builder pre-set to match, ready for the customer's own photo.
export const CONCEPTS: Concept[] = [
  { slug: "gameday-coffee-table", title: "Game Day Coffee Table", blurb: "Your rivalry, under glass, in the living room.", image: "/media/gen/idea-gameday-coffee.webp", config: c("table", { size: "coffee", imageUrl: "/media/florida-classic.jpg", effects: ["sparkle"], flake: "silver" }) },
  { slug: "man-cave-helmet", title: "Man Cave Helmet", blurb: "A helmet-cut wall piece for your team.", image: "/media/gen/idea-helmet-mancave.webp", config: c("helmet", { size: "l", imageUrl: "/media/cowboys-helmet.jpg", frame: "black", flake: "silver", transform: { x: 0.02, y: 0.02, scale: 1.12, rotation: 0 } }) },
  { slug: "gold-rush-round", title: "Gold Name Round Table", blurb: "Family name in gold leaf, round top.", image: "/media/gen/idea-round-gold.webp", config: c("table", { size: "round", imageUrl: "/media/ponds-top.jpg", effects: ["goldflake"], flake: "gold", frame: "black", transform: { x: 0, y: 0, scale: 1.05, rotation: 0 } }) },
  { slug: "maroon-gold-dining", title: "Maroon & Gold Dining", blurb: "School colors on the big table.", image: "/media/gen/idea-maroon-dining.webp", config: c("table", { size: "dining", imageUrl: "/media/bcu-helmet-panel.jpg", flake: "gold", frame: "black" }) },
  { slug: "sports-bar-helmet-trio", title: "Sports Bar Helmet Trio", blurb: "A row of helmets for the bar or shop.", image: "/media/gen/idea-helmet-trio.webp", config: c("helmet", { size: "m", imageUrl: "/media/bcu-helmet-panel.jpg", effects: ["neon"], frame: "gold", transform: { x: -0.08, y: 0, scale: 1.25, rotation: 0 } }) },
  { slug: "family-portrait-wall", title: "Family Portrait Wall", blurb: "Your family photo with a holo shimmer.", image: "/media/gen/idea-family-wall.webp", config: c("wall", { size: "24x36", orientation: "portrait", imageUrl: null, effects: ["holo"] }) },
];

export const findShop = (slug: string) => SHOP.find((s) => s.slug === slug);
export const findConcept = (slug: string) => CONCEPTS.find((s) => s.slug === slug);
