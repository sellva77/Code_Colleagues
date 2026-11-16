import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { mailConfigured, recipientList } from "@/lib/mail";

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  return NextResponse.json({
    mailConfigured: mailConfigured(),
    mailTo: recipientList(),
  });
}
