"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { api, useUser } from "./providers";
import type { PublicUser } from "@/lib/auth";
import { US_STATES } from "@/lib/site";

export function AuthForm({ onDone, initialMode = "signup" }: { onDone?: (u: PublicUser) => void; initialMode?: "signup" | "login" }) {
  const { setUser, refresh } = useUser();
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [f, setF] = useState({ name: "", email: "", password: "", phone: "", state: "TN" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await api<{ user: PublicUser }>(`/api/auth/${mode}`, f);
      setUser(r.user);
      refresh();
      onDone?.(r.user);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="mb-5 grid grid-cols-2 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
        {(["signup", "login"] as const).map((m) => (
          <button type="button" key={m} onClick={() => setMode(m)} className="relative rounded-full py-2 font-tag text-xs">
            {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15" transition={{ type: "spring", duration: 0.35, bounce: 0.15 }} />}
            <span className="relative">{m === "signup" ? "Create account" : "Sign in"}</span>
          </button>
        ))}
      </div>
      {mode === "signup" && <input className="input" placeholder="Your name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />}
      <input className="input" type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
      <input className="input" type="password" placeholder="Password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
      {mode === "signup" && (
        <div className="grid grid-cols-[1fr_96px] gap-2">
          <input className="input" type="tel" placeholder="Phone (optional)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
          <select className="input" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}>
            {US_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      {err && <p className="text-sm text-red">{err}</p>}
      <button className="btn h-13 w-full" disabled={busy}>
        {busy && <Loader2 size={16} className="animate-spin" />} {mode === "signup" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}

export function AuthSheet({ open, onClose, reason }: { open: boolean; onClose: () => void; reason?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[71] mx-auto max-w-md rounded-t-[2rem] border border-line bg-ink-2 p-6 md:bottom-auto md:top-[14vh] md:rounded-[2rem]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%", transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <button onClick={onClose} className="press absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/5" aria-label="Close">
              <X size={16} />
            </button>
            <h2 className="font-display text-4xl font-black">Save your work</h2>
            {reason && <p className="mb-5 mt-1 text-sm text-muted">{reason}</p>}
            <AuthForm onDone={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
