import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAuthed()) redirect("/admin");
  return (
    <div className="login-screen">
      <LoginForm />
    </div>
  );
}
