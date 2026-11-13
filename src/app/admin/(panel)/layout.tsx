import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect("/admin/login");
  return children;
}
