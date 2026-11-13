import { NextResponse } from "next/server";
import { addInquiry, updateInquiry } from "@/lib/store";
import { sendInquiryEmail } from "@/lib/mail";
import { validateInquiry } from "@/lib/validate";
import { clientIp, formLimited } from "@/lib/request";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Please fill in the form again." }, { status: 400 });
  }

  if (String(body.company_site || "").trim()) {
    return NextResponse.json({ ok: true, emailed: true });
  }

  const startedAt = Number(body.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 1200) {
    return NextResponse.json({ ok: true, emailed: true });
  }

  if (formLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many messages from this connection. Please wait a few minutes, or call us." },
      { status: 429 },
    );
  }

  const parsed = validateInquiry(body, { messageRequired: true });
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const inquiry = await addInquiry({
    ...parsed.value,
    source: "website",
    status: "new",
    notes: "",
    emailSent: false,
    emailError: "",
  });

  try {
    await sendInquiryEmail(inquiry, new URL(request.url).origin);
    await updateInquiry(inquiry.id, { emailSent: true, emailError: "" });
    return NextResponse.json({ ok: true, emailed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : "Email failed";
    await updateInquiry(inquiry.id, { emailSent: false, emailError: message });
    console.error("Inquiry saved but email failed:", message);
    const needsConfirm = /activat/i.test(message);
    return NextResponse.json(
      {
        error: needsConfirm
          ? "Open codecolleagues@gmail.com, click the Activate link in the confirmation mail, then press Enroll again."
          : "We could not email your details. Please write to codecolleagues@gmail.com.",
      },
      { status: 502 },
    );
  }
}
