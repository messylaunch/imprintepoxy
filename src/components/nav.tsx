"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hammer, Home, LayoutGrid, ShoppingBag, FolderHeart, User, Shield } from "lucide-react";
import { useCart, useUser, api } from "./providers";
import { useEffect, useState } from "react";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/build", label: "Design yours" },
  { href: "/projects", label: "My projects" },
  { href: "/imprint", label: "Our mission" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img src="/icon.png" alt="" className="h-8 w-8" />
      <span className="leading-none">
        <span className="block text-[1.05rem] font-semibold tracking-[-0.02em]">Imprint</span>
        <span className="block text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted">Epoxy Design</span>
      </span>
    </span>
  );
}

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
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${scrolled ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="press" aria-label="Imprint Epoxy Design home">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => {
              const on = path === l.href || path.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} className={`relative py-2 text-sm transition-colors ${on ? "text-fg" : "text-fg/65 hover:text-fg"}`}>
                  {l.label}
                  {on && <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-px bg-fg" transition={{ type: "spring", duration: 0.4, bounce: 0.1 }} />}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1.5">
            {staff && (
              <Link href="/admin" className="btn btn-ghost btn-sm hidden md:inline-flex">
                <Shield size={14} /> Owner
              </Link>
            )}
            <Link href={user ? "/account" : "/login"} className="press hidden h-10 items-center gap-2 rounded-full px-3 text-sm text-fg/70 hover:text-fg md:flex">
              <User size={17} />
              <span className="max-w-28 truncate">{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>
            <Link href="/cart" className="press relative grid h-10 w-10 place-items-center rounded-full hover:bg-white/5" aria-label="Cart">
              <ShoppingBag size={19} />
              {count > 0 && (
                <motion.span key={bump} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.35, bounce: 0.3 }} className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red px-1 text-[10px] font-semibold">
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
    { href: "/build", label: "Design", icon: Hammer },
    { href: "/projects", label: "Projects", icon: FolderHeart },
    staff ? { href: "/admin", label: "Owner", icon: Shield } : { href: "/account", label: "Account", icon: User },
  ];
  if (path.startsWith("/build/") || path.startsWith("/checkout")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink/85 backdrop-blur-xl md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {tabs.map((t) => {
          const on = t.href === "/" ? path === "/" : path === t.href || path.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href} className="press flex w-16 flex-col items-center gap-1 py-1.5">
              <Icon size={21} strokeWidth={on ? 2.2 : 1.7} className={on ? (t.href === "/build" ? "text-red" : "text-fg") : "text-muted"} />
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
    <div className="fixed inset-x-0 top-16 z-40 flex items-center justify-center gap-3 bg-gold px-4 py-1.5 text-xs font-medium text-black">
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
  if (path.startsWith("/build/") || path.endsWith("/show") || path.startsWith("/admin")) return null;
  return (
    <footer className="mt-32 border-t border-line pb-24 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:px-8">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">Custom epoxy tables, helmet displays and wall art, poured by hand. Every piece supports Imprint, our community nonprofit.</p>
        </div>
        <FooterCol title="Shop" items={[["/shop", "Finished pieces"], ["/build/table", "Custom tables"], ["/build/helmet", "Helmet displays"], ["/build/wall", "Wall art"]]} />
        <FooterCol title="Help" items={[["/#faq", "FAQ"], ["/build/custom", "Special request"], ["/projects", "My projects"], ["/account", "Orders"]]} />
        <FooterCol title="Imprint" items={[["/imprint", "Our mission"], ["/qr", "Event QR code"]]} />
      </div>
      <div className="mx-auto max-w-7xl px-5 text-xs text-muted md:px-8">© {new Date().getFullYear()} Imprint Epoxy Design</div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="space-y-2.5 text-sm">
      <p className="mb-3 text-xs font-medium text-muted">{title}</p>
      {items.map(([href, label]) => (
        <Link key={href} href={href} className="block text-fg/80 transition-colors hover:text-fg">
          {label}
        </Link>
      ))}
    </div>
  );
}
