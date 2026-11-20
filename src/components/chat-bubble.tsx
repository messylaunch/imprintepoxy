"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, FolderHeart, HelpCircle, MessageCircle, Send, X } from "lucide-react";
import { api, useUser } from "./providers";

type Msg = { id: string; body: string; fromStaff: boolean; authorName: string; createdAt: string; attachmentId?: string | null };
type Conv = { id: string; topic: string; project: { id: string; name: string } | null; userUnread: boolean; lastMessageAt: string; messages: Msg[] };
type View = { v: "home" } | { v: "pick" } | { v: "thread"; id: string | null; projectId?: string | null; projectName?: string | null; topic: string };

export function openChat(detail?: { projectId?: string; projectName?: string }) {
  window.dispatchEvent(new CustomEvent("ie:chat", { detail }));
}

export function ChatBubble() {
  const path = usePathname();
  const { user, refresh } = useUser();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ v: "home" });
  const [convs, setConvs] = useState<Conv[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [unread, setUnread] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const r = await api<{ conversations: Conv[]; projects: { id: string; name: string }[]; unread: boolean }>("/api/chat");
      setConvs(r.conversations);
      setProjects(r.projects ?? []);
      setUnread(r.unread);
    } catch {}
  }, [user]);

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { projectId?: string; projectName?: string } | undefined;
      setOpen(true);
      if (d?.projectId) {
        const existing = convs.find((c) => c.project?.id === d.projectId);
        setView({ v: "thread", id: existing?.id ?? null, projectId: d.projectId, projectName: d.projectName, topic: "project" });
      } else setView({ v: "home" });
    };
    window.addEventListener("ie:chat", h);
    return () => window.removeEventListener("ie:chat", h);
  }, [convs]);

  if (path.endsWith("/show") || path.startsWith("/admin")) return null;
  // focused flows: keep the phone screen clear (desktop still shows the bubble)
  const focused = /^\/build\/(table|helmet|wall)/.test(path) || path.startsWith("/checkout");

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-24 right-4 z-[60] h-14 w-14 place-items-center rounded-full md:bottom-6 md:right-6 ${focused && !open ? "hidden md:grid" : "grid"}`}
        style={{ background: "var(--color-red)", boxShadow: "0 8px 24px -8px rgba(0,0,0,.6)" }}
        whileTap={{ scale: 0.94 }}
        aria-label="Chat with us"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "m"} initial={{ opacity: 0, rotate: -45, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 45, scale: 0.8 }} transition={{ duration: 0.15 }}>
            {open ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.span>
        </AnimatePresence>
        {unread && !open && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-white ring-2 ring-red" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-x-3 bottom-40 z-[60] flex max-h-[min(72svh,620px)] flex-col overflow-hidden rounded-[1.6rem] border border-line bg-ink-2/95 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl md:inset-x-auto md:bottom-24 md:right-6 md:w-[390px]"
          >
            {view.v === "home" && (
              <div className="overflow-y-auto p-5">
                <img src="/media/logo-256.png" alt="" className="h-12" />
                <h3 className="font-display mt-3 text-3xl">Hey{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</h3>
                <p className="mt-1 text-sm text-muted">What do you need help with?</p>
                <div className="mt-5 grid gap-2">
                  <Option icon={HelpCircle} title="General question" sub="Pricing, timing, pickup, anything" onClick={() => setView({ v: "thread", id: null, topic: "general" })} />
                  <Option icon={FolderHeart} title="Help with my project" sub={user ? (projects.length ? `${projects.length} saved project${projects.length > 1 ? "s" : ""}` : "Save a design first") : "Sign in to pick a project"} onClick={() => (projects.length ? setView({ v: "pick" }) : setView({ v: "thread", id: null, topic: "general" }))} />
                </div>
                {convs.length > 0 && (
                  <>
                    <p className="label mt-6">Recent</p>
                    <div className="grid gap-1.5">
                      {convs.slice(0, 5).map((c) => (
                        <button key={c.id} onClick={() => setView({ v: "thread", id: c.id, topic: c.topic, projectName: c.project?.name })} className="press flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 text-left ring-1 ring-white/5 hover:bg-white/[0.06]">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${c.userUnread ? "bg-red" : "bg-white/20"}`} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{c.project ? c.project.name : c.topic === "custom" ? "Special request" : "General question"}</span>
                            <span className="block truncate text-xs text-muted">{c.messages[0]?.body}</span>
                          </span>
                          <ChevronRight size={16} className="text-muted" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {view.v === "pick" && (
              <div className="overflow-y-auto p-5">
                <BackBtn onClick={() => setView({ v: "home" })} />
                <h3 className="font-display mt-3 text-2xl">Which project?</h3>
                <div className="mt-4 grid gap-2">
                  {projects.map((p) => {
                    const existing = convs.find((c) => c.project?.id === p.id);
                    return <Option key={p.id} icon={FolderHeart} title={p.name} sub={existing ? "Continue conversation" : "Start a conversation"} onClick={() => setView({ v: "thread", id: existing?.id ?? null, projectId: p.id, projectName: p.name, topic: "project" })} />;
                  })}
                </div>
              </div>
            )}
            {view.v === "thread" && (
              <Thread
                key={view.id ?? `new-${view.projectId}`}
                view={view}
                onBack={() => setView({ v: "home" })}
                onCreated={(id) => {
                  setView({ ...view, id });
                  load();
                }}
                onLead={refresh}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Option({ icon: Icon, title, sub, onClick }: { icon: typeof HelpCircle; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="press flex items-center gap-3 rounded-2xl bg-white/[0.04] p-4 text-left ring-1 ring-white/10 hover:bg-white/[0.07]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "var(--candy)" }}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted">{sub}</span>
      </span>
      <ChevronRight size={16} className="text-muted" />
    </button>
  );
}

const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="press font-tag flex items-center gap-1 text-[0.65rem] text-muted hover:text-fg">
    <ArrowLeft size={14} /> Back
  </button>
);

function Thread({ view, onBack, onCreated, onLead }: { view: Extract<View, { v: "thread" }>; onBack: () => void; onCreated: (id: string) => void; onLead: () => void }) {
  const { user } = useUser();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const idRef = useRef(view.id);

  const pull = useCallback(async () => {
    if (!idRef.current) return;
    try {
      const r = await api<{ conversation: { messages: Msg[] } }>(`/api/chat?c=${idRef.current}`);
      setMsgs(r.conversation.messages);
    } catch {}
  }, []);
  useEffect(() => {
    pull();
    const t = setInterval(pull, 4000);
    return () => clearInterval(t);
  }, [pull]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setErr("");
    setSending(true);
    const body = text;
    setText("");
    setMsgs((m) => [...m, { id: "tmp" + Date.now(), body, fromStaff: false, authorName: user?.name ?? lead.name, createdAt: new Date().toISOString() }]);
    try {
      const r = await api<{ conversationId: string }>("/api/chat", { conversationId: idRef.current, projectId: view.projectId, body, lead: user ? undefined : lead });
      if (!user) onLead();
      if (!idRef.current) {
        idRef.current = r.conversationId;
        onCreated(r.conversationId);
      }
      pull();
    } catch (e) {
      setErr((e as Error).message);
      setText(body);
      setMsgs((m) => m.filter((x) => !x.id.startsWith("tmp")));
    } finally {
      setSending(false);
    }
  }

  const title = view.projectName ?? (view.topic === "custom" ? "Special request" : "General question");
  return (
    <>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <BackBtn onClick={onBack} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Usually replies within a few hours
          </p>
        </div>
      </div>
      <div className="min-h-40 flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <div className="rounded-2xl bg-white/[0.04] p-3 text-sm text-fg/80">
            {view.projectId ? `Ask us anything about “${view.projectName}”. We can see your designs.` : "Ask away. A real person on our team will reply right here."}
          </div>
        )}
        {msgs.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.fromStaff ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${m.fromStaff ? "rounded-bl-md bg-white/[0.07]" : "rounded-br-md text-white"}`} style={m.fromStaff ? undefined : { background: "var(--candy)" }}>
              {m.fromStaff && <span className="font-tag mb-0.5 block text-[0.55rem] text-red">{m.authorName} · Imprint</span>}
              {m.attachmentId ? <img src={`/api/uploads/${m.attachmentId}`} alt="" className="mt-1 max-h-40 rounded-lg" /> : m.body}
            </div>
          </motion.div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="space-y-2 border-t border-line p-3">
        {!user && (
          <div className="grid grid-cols-2 gap-2">
            <input className="input h-10 text-sm" placeholder="Name" required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
            <input className="input h-10 text-sm" type="email" placeholder="Email" required value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
            <input className="input col-span-2 h-10 text-sm" type="tel" placeholder="Phone (optional, for a call back)" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
          </div>
        )}
        {err && <p className="text-xs text-red">{err}</p>}
        <div className="flex gap-2">
          <input className="input h-11 flex-1" placeholder="Message…" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn h-11 w-11 shrink-0 px-0" disabled={sending || !text.trim()} aria-label="Send">
            <Send size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
