"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { api, useToast } from "@/components/providers";

export function ViewAsButton({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-chrome mt-5 w-full"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await api("/api/admin/impersonate", { userId });
        router.push("/projects");
        router.refresh();
      }}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} View site as {name.split(" ")[0]}
    </button>
  );
}

export function NotesBox({ userId, initial }: { userId: string; initial: string }) {
  const [v, setV] = useState(initial);
  const toast = useToast();
  return (
    <div className="panel p-4">
      <label className="label">Private notes</label>
      <textarea className="input text-sm" rows={4} value={v} onChange={(e) => setV(e.target.value)} placeholder="Called 11/20, wants it before the Classic…" onBlur={async () => {
        if (v === initial) return;
        await api(`/api/admin/customers/${userId}`, { notes: v }, "PATCH");
        toast("Notes saved");
      }} />
    </div>
  );
}
