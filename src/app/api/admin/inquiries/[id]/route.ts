import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getInquiry, removeInquiry, updateInquiry } from "@/lib/store";
import { sendInquiryEmail } from "@/lib/mail";
import type { InquiryStatus } from "@/lib/types";
import { cleanMessage } from "@/lib/validate";

const statuses: InquiryStatus[] = ["new", "checked", "enrolled", "closed"];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { id } = await context.params;
  let body: { status?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Could not read that update." }, { status: 400 });
  }

  const patch: { status?: InquiryStatus; notes?: string } = {};
  if (body.status !== undefined) {
    if (!statuses.includes(body.status as InquiryStatus)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    }
    patch.status = body.status as InquiryStatus;
  }
  if (body.notes !== undefined) {
    patch.notes = cleanMessage(body.notes);
  }

  const item = await updateInquiry(id, patch);
  if (!item) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const { id } = await context.params;
  const removed = await removeInquiry(id);
  if (!removed) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(_request: Request, context: RouteContext) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const { id } = await context.params;
  const existing = getInquiry(id);
  if (!existing) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });

  try {
    await sendInquiryEmail(existing);
    const item = await updateInquiry(id, { emailSent: true, emailError: "" });
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : "Email failed";
    const item = await updateInquiry(id, { emailSent: false, emailError: message });
    return NextResponse.json({ error: message, item }, { status: 502 });
  }
}
