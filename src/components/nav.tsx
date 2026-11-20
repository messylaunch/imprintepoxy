"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hammer, Home, LayoutGrid, ShoppingBag, FolderHeart, User, Shield } from "lucide-react";
import { useCart, useUser, api } from "./providers";
import { useEffect, useState } from "react";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/build", label: "Build Your Own" },
  { href: "/projects", label: "My Projects" },
  { href: "/imprint", label: "Imprint" },
];

export function Nav() {
  const path = usePathname();
  const { count, bump } = useCart();
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  if ((path.startsWith("/projects/") && path.endsWith("/show")) || /^\/build\/(table|helmet|wall)/.test(path)) return null;
  const staff = user && (user.role === "OWNER" || user.role === "STAFF");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300 ${
          scrolled ? "border-b border-line bg-ink/75 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="press flex items-center gap-2">
            <img src="/media/logo-256.png" alt="Imprint Epoxy Design" className="h-11 w-auto drop-shadow-[0_0_12px_rgba(255,0,0,0.35)]" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const on = path === l.href || path.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} className="relative px-4 py-2 font-tag text-[0.78rem] text-fg/80 transition-colors hover:text-fg">
                  {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {staff && (
              <Link href="/admin" className="btn btn-ghost btn-sm hidden md:inline-flex">
                <Shield size={14} /> Owner
              </Link>
            )}
            <Link href={user ? "/account" : "/login"} className="press hidden h-10 items-center gap-2 rounded-full px-3 text-sm text-fg/80 hover:text-fg md:flex">
              <User size={18} />
              <span className="max-w-28 truncate">{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>
            <Link href="/cart" className="press relative grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10" aria-label="Cart">
              <ShoppingBag size={18} />
              {count > 0 && (
                <motion.span
                  key={bump}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.4 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 text-[10px] font-bold shadow-[0_0_12px_#ff1f1f]"
                >
                  {count}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <MobileTabs path={path} staff={!!staff} />
    </>
  );
}

function MobileTabs({ path, staff }: { path: string; staff: boolean }) {
  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: LayoutGrid },
    { href: "/build", label: "Build", icon: Hammer, hero: true },
    { href: "/projects", label: "Projects", icon: FolderHeart },
    staff ? { href: "/admin", label: "Owner", icon: Shield } : { href: "/account", label: "Me", icon: User },
  ];
  if (path.startsWith("/build/") || path.startsWith("/checkout")) return null;
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="glass flex items-center justify-around rounded-[1.6rem] px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {tabs.map((t) => {
          const on = t.href === "/" ? path === "/" : path === t.href || path.startsWith(t.href + "/");
          const Icon = t.icon;
          if (t.hero)
            return (
              <Link key={t.href} href={t.href} className="press -mt-7 grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--candy)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 10px 30px -4px rgba(255,20,20,.7)" }} aria-label="Build your own">
                <Icon size={22} />
              </Link>
            );
          return (
            <Link key={t.href} href={t.href} className="press relative flex w-14 flex-col items-center gap-0.5 py-1.5">
              {on && <motion.span layoutId="tab-dot" className="absolute -top-0.5 h-1 w-5 rounded-full bg-red shadow-[0_0_10px_#ff1f1f]" transition={{ type: "spring", duration: 0.4, bounce: 0.2 }} />}
              <Icon size={19} className={on ? "text-fg" : "text-muted"} />
              <span className={`text-[10px] ${on ? "text-fg" : "text-muted"}`}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function ImpersonationBanner({ name }: { name: string }) {
  const router = useRouter();
  return (
    <div className="fixed inset-x-0 top-16 z-40 flex items-center justify-center gap-3 bg-gold px-4 py-1.5 text-xs font-semibold text-black">
      Viewing as {name}. You can see and edit their projects.
      <button
        className="rounded-full bg-black px-3 py-1 text-[11px] text-gold"
        onClick={async () => {
          await api("/api/admin/impersonate", {}, "DELETE");
          router.push("/admin");
          router.refresh();
        }}
      >
        Exit
      </button>
    </div>
  );
}

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/build/") || path.endsWith("/show")) return null;
  return (
    <footer className="relative mt-24 border-t border-line pb-28 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div>
          <img src="/media/logo-640.webp" alt="" className="w-56" />
          <p className="mt-4 max-w-sm text-sm text-muted">Custom epoxy tables, helmet displays & wall art. Every piece supports Imprint, our nonprofit helping people leave their mark on their community.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-tag text-xs text-muted">Explore</p>
          <Link className="block hover:text-red" href="/shop">Shop finished pieces</Link>
          <Link className="block hover:text-red" href="/build">Build your own</Link>
          <Link className="block hover:text-red" href="/build/custom">Special request</Link>
          <Link className="block hover:text-red" href="/qr">Event QR code</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-tag text-xs text-muted">Supported by</p>
          <Link href="/imprint" className="press inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <span className="h-2 w-2 rounded-full bg-red" /> Imprint nonprofit
          </Link>
          <p className="text-muted">© {new Date().getFullYear()} Imprint Epoxy Design</p>
        </div>
      </div>
    </footer>
  );
}
