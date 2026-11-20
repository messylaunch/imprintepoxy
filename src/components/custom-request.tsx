"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ImagePlus, Loader2, X } from "lucide-react";
import { api, useUser } from "./providers";
import { ContactButtons } from "./contact";
import { site } from "@/lib/site";

const KINDS = ["Table", "Helmet display", "Wall art", "Something else"];

export function CustomRequest({ projects }: { projects: { id: string; name: string }[] }) {
  const { user, refresh } = useUser();
  const [kind, setKind] = useState(KINDS[0]);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [f, setF] = useState({ details: "", budget: "", deadline: "", name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("kind", kind);
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      files.forEach((x) => fd.append("files", x.file));
      await api("/api/requests", fd);
      setDone(true);
      refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-6">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="panel p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ background: "var(--candy)" }}>
              <Check />
            </div>
            <h1 className="font-display mt-6 text-4xl">Request sent</h1>
            <p className="mx-auto mt-3 max-w-md text-muted">We'll look at your pieces and get back to you with ideas and a quote. You can keep chatting with us from the bubble in the corner.</p>
            <ContactButtons size="sm" className="mt-6 justify-center" />
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/build" className="btn btn-ghost">Build something else</Link>
              <Link href="/shop" className="btn">Browse the shop</Link>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -10 }} className="stagger space-y-8">
            <div>
              <h1 className="font-display text-5xl md:text-6xl">
                Got something
                <span className="font-serif"> different?</span>
              </h1>
              <p className="mt-4 text-muted">Upload your pieces, photos or sketches and tell us the idea. We&apos;ll work it out together. Prefer to talk? Call or text {site.phone}.</p>
            </div>

            <div>
              <div className="label">What is it?</div>
              <div className="flex flex-wrap gap-2">
                {KINDS.map((k) => (
                  <button type="button" key={k} data-on={kind === k} onClick={() => setKind(k)} className="chip px-4 py-2.5 text-sm">
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="label">Your pieces</div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {files.map((x, i) => (
                  <div key={x.url} className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <img src={x.url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setFiles(files.filter((_, k) => k !== i))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/70">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {files.length < 10 && (
                  <button type="button" onClick={() => input.current?.click()} className="press grid aspect-square place-items-center rounded-2xl border border-dashed border-white/20 text-muted hover:border-red hover:text-red">
                    <ImagePlus />
                  </button>
                )}
              </div>
              <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? []).slice(0, 10 - files.length).map((file) => ({ file, url: URL.createObjectURL(file) }))])} />
            </div>

            <div>
              <label className="label">Tell us the idea</label>
              <textarea className="input" rows={5} required placeholder="e.g. A 6ft bar top with our 4 team photos, red flake, our logo in the middle…" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Budget (optional)</label>
                <input className="input" placeholder="$" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} />
              </div>
              <div>
                <label className="label">Need it by (optional)</label>
                <input className="input" type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
              </div>
            </div>

            {!user && (
              <div className="grid gap-3 sm:grid-cols-3">
                <input className="input" placeholder="Name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <input className="input" type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <input className="input" type="tel" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </div>
            )}
            {projects.length > 0 && <p className="text-xs text-muted">Tip: you can also open any of your projects and chat with us about it directly.</p>}
            {err && <p className="text-sm text-red">{err}</p>}
            <button className="btn h-14 w-full" disabled={busy}>
              {busy && <Loader2 size={16} className="animate-spin" />} Send request
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
