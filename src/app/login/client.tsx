"use client";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-sheet";

export function LoginClient() {
  const router = useRouter();
  return <AuthForm initialMode="login" onDone={(u) => router.push(u.role === "CUSTOMER" ? "/projects" : "/admin")} />;
}
