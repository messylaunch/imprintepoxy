import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { LoginClient } from "./client";

export const metadata = { title: "Sign in" };

export default async function Login() {
  if (await getUser()) redirect("/account");
  return (
    <div className="mx-auto max-w-md px-4 pt-28">
      <h1 className="font-display text-6xl font-black">
        <span className="chrome-text">Welcome back</span>
      </h1>
      <p className="mb-6 mt-2 text-sm text-muted">Sign in to see your projects, orders and messages.</p>
      <div className="panel p-6">
        <LoginClient />
      </div>
    </div>
  );
}
