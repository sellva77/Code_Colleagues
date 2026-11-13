import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { sendTestEmail } from "@/lib/mail";

export async function POST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  try {
    await sendTestEmail();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test email failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
