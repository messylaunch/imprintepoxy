"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { api, useUser } from "@/components/providers";

export function SignOut() {
  const router = useRouter();
  const { setUser } = useUser();
  return (
    <button
      className="btn btn-ghost"
      onClick={async () => {
        await api("/api/auth/logout", {});
        setUser(null);
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut size={16} /> Sign out
    </button>
  );
}
