export function ago(d: Date) {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString();
}
const SRC: Record<string, string> = { signup: "Account", chat: "Chat lead", checkout: "Buyer", request: "Request", seed: "Account" };
export function SourceBadge({ s }: { s: string }) {
  const hot = s === "chat" || s === "request";
  return <span className={`font-tag shrink-0 rounded-full px-2 py-0.5 text-[0.55rem] ring-1 ${hot ? "bg-red/15 text-red ring-red/40" : "bg-white/5 text-muted ring-white/10"}`}>{SRC[s] ?? s}</span>;
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: "var(--candy)" }}>
      {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
    </span>
  );
}
