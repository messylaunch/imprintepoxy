"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { api } from "@/components/providers";

type Msg = { id: string; body: string; fromStaff: boolean; authorName: string; createdAt: string; attachmentId?: string | null };

export function StaffThread({ id, initial, compact }: { id: string; initial: Msg[]; compact?: boolean }) {
  const router = useRouter();
  const [msgs, setMsgs] = useState(initial);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const pull = useCallback(async () => {
    try {
      const r = await api<{ messages: Msg[] }>(`/api/admin/conversations/${id}`);
      setMsgs(r.messages);
    } catch {}
  }, [id]);
  useEffect(() => {
    setMsgs(initial);
    pull().then(() => router.refresh());
    const t = setInterval(pull, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    if (first.current && compact) { first.current = false; return; }
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs.length, compact]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const body = text;
    setText("");
    setMsgs((m) => [...m, { id: "tmp", body, fromStaff: true, authorName: "You", createdAt: new Date().toISOString() }]);
    await api("/api/admin/reply", { conversationId: id, body });
    pull();
  }

  return (
    <div className="flex h-full flex-col">
      <div className={`flex-1 space-y-2 overflow-y-auto p-4 ${compact ? "max-h-80" : ""}`}>
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.fromStaff ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${m.fromStaff ? "rounded-br-md text-white" : "rounded-bl-md bg-white/[0.07]"}`} style={m.fromStaff ? { background: "var(--candy)" } : undefined}>
              <span suppressHydrationWarning className="mb-0.5 block text-[10px] opacity-70">{m.authorName} · {new Date(m.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              {m.attachmentId ? <a href={`/api/uploads/${m.attachmentId}`} target="_blank"><img src={`/api/uploads/${m.attachmentId}`} alt="" className="max-h-48 rounded-lg" /></a> : m.body}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
        <input className="input h-11 flex-1" placeholder="Reply…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn h-11 w-11 px-0" aria-label="Send"><Send size={16} /></button>
      </form>
    </div>
  );
}
