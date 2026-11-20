"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { DesignConfig } from "@/lib/design";
import type { PublicUser } from "@/lib/auth";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

// ---------------- user ----------------
type UserCtx = { user: PublicUser | null; setUser: (u: PublicUser | null) => void; refresh: () => void };
const UserContext = createContext<UserCtx>({ user: null, setUser: () => {}, refresh: () => {} });
export const useUser = () => useContext(UserContext);

// ---------------- cart ----------------
export type CartLine = {
  id: string;
  kind: "shop" | "design";
  title: string;
  price: number;
  qty: number;
  thumb: string;
  slug?: string;
  designId?: string;
  config?: DesignConfig;
  details?: string[];
};
type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (l: Omit<CartLine, "id" | "qty"> & { qty?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, q: number) => void;
  clear: () => void;
  bump: number;
};
const CartContext = createContext<CartCtx>(null as unknown as CartCtx);
export const useCart = () => useContext(CartContext);

// ---------------- toast ----------------
type Toast = { id: number; text: string; action?: { label: string; href: string } };
const ToastContext = createContext<(text: string, action?: Toast["action"]) => void>(() => {});
export const useToast = () => useContext(ToastContext);

const KEY = "ie_cart_v1";

export function Providers({ user: initialUser, children }: { user: PublicUser | null; children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  const refresh = useCallback(() => router.refresh(), [router]);

  const [lines, setLines] = useState<CartLine[]>([]);
  const [bump, setBump] = useState(0);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((text: string, action?: Toast["action"]) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const cart = useMemo<CartCtx>(
    () => ({
      lines,
      bump,
      count: lines.reduce((a, l) => a + l.qty, 0),
      subtotal: lines.reduce((a, l) => a + l.qty * l.price, 0),
      add: (l) => {
        setLines((cur) => {
          const same = l.kind === "shop" ? cur.find((c) => c.kind === "shop" && c.slug === l.slug) : l.designId ? cur.find((c) => c.designId === l.designId) : undefined;
          if (same) return cur.map((c) => (c === same ? { ...c, ...l, qty: c.qty + (l.kind === "shop" ? 1 : 0) || 1 } : c));
          return [...cur, { ...l, id: Math.random().toString(36).slice(2), qty: l.qty ?? 1 }];
        });
        setBump((b) => b + 1);
      },
      remove: (id) => setLines((c) => c.filter((l) => l.id !== id)),
      setQty: (id, q) => setLines((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(9, q)) } : l))),
      clear: () => setLines([]),
    }),
    [lines, bump]
  );

  return (
    <UserContext.Provider value={{ user, setUser, refresh }}>
      <CartContext.Provider value={cart}>
        <ToastContext.Provider value={toast}>
          {children}
          <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-4">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -16, scale: 0.96, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
                  className="glass pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2.5 text-sm shadow-2xl"
                >
                  <span className="h-2 w-2 rounded-full bg-red shadow-[0_0_10px_#ff1f1f]" />
                  {t.text}
                  {t.action && (
                    <a href={t.action.href} className="font-tag text-xs text-red">
                      {t.action.label}
                    </a>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ToastContext.Provider>
      </CartContext.Provider>
    </UserContext.Provider>
  );
}

export async function api<T = unknown>(url: string, body?: unknown, method?: string): Promise<T> {
  const r = await fetch(url, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body instanceof FormData || body === undefined ? undefined : { "content-type": "application/json" },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || "Something went wrong");
  return data as T;
}
