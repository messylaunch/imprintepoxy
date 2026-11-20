import { Mail, MessageSquare, Phone } from "lucide-react";
import { site } from "@/lib/site";

/** Call / text / email buttons. */
export function ContactButtons({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const b = size === "sm" ? "btn btn-ghost btn-sm" : "btn btn-ghost";
  const i = size === "sm" ? 14 : 16;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a href={site.phoneHref} className={b}>
        <Phone size={i} /> Call
      </a>
      <a href={site.smsHref} className={b}>
        <MessageSquare size={i} /> Text
      </a>
      <a href={site.emailHref} className={b}>
        <Mail size={i} /> Email
      </a>
    </div>
  );
}

/** Small block with the phone number and email written out. */
export function ContactBlock({ title = "Talk to a person", className = "" }: { title?: string; className?: string }) {
  return (
    <div className={className}>
      <p className="font-medium">{title}</p>
      <div className="mt-2 space-y-1 text-sm">
        <a href={site.phoneHref} className="block text-fg/80 hover:text-fg">{site.phone}</a>
        <a href={site.emailHref} className="block break-all text-fg/80 hover:text-fg">{site.email}</a>
      </div>
    </div>
  );
}
