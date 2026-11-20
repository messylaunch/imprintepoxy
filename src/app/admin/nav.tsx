"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/customers", label: "Customers & leads" },
    { href: "/admin/inbox", label: "Inbox", badge: unread },
    { href: "/admin/orders", label: "Orders" },
  ];
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-white/[0.04] p-1 ring-1 ring-white/10">
      {items.map((i) => {
        const on = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className="relative shrink-0 rounded-full px-4 py-2 font-tag text-[0.7rem]">
            {on && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-full" style={{ background: "var(--candy)" }} transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
            <span className="relative flex items-center gap-2">
              {i.label}
              {!!i.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-bold not-italic text-red">{i.badge}</span>}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
