import type { Metadata } from "next";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = { title: "Inquiries" };

export default function AdminHomePage() {
  return <Dashboard />;
}
