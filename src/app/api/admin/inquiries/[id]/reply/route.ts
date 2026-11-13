import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { sendClientReply } from "@/lib/mail";
import { getInquiry, updateInquiry } from "@/lib/store";
import { cleanLine, cleanMessage } from "@/lib/validate";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = getInquiry(id);
  if (!existing) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });

  let body: { subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Could not read that reply." }, { status: 400 });
  }

  const message = cleanMessage(body.message);
  const subject = cleanLine(body.subject, 140) || `Reply from Code Colleagues about ${existing.service}`;
  if (message.length < 2) {
    return NextResponse.json({ error: "Write the reply before sending it." }, { status: 400 });
  }

  try {
    await sendClientReply(existing, subject, message);
    const item = await updateInquiry(id, { lastReplyAt: new Date().toISOString(), lastReplyError: "" });
    return NextResponse.json({ item });
  } catch (error) {
    const note = error instanceof Error ? error.message.slice(0, 300) : "Email failed";
    const item = await updateInquiry(id, { lastReplyError: note });
    return NextResponse.json({ error: note, item }, { status: 502 });
  }
}
