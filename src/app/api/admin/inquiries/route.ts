import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { addInquiry, listInquiries } from "@/lib/store";
import type { Inquiry } from "@/lib/types";
import { validateInquiry } from "@/lib/validate";

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function toCsv(items: Inquiry[]) {
  const headers = [
    "Created",
    "Name",
    "Email",
    "Phone",
    "Business",
    "Need",
    "Message",
    "Status",
    "Source",
    "Email sent",
    "Email error",
    "Notes",
  ];
  const lines = items.map((item) =>
    [
      item.createdAt,
      item.name,
      item.email,
      item.phone,
      item.company,
      item.service,
      item.message,
      item.status,
      item.source,
      item.emailSent ? "yes" : "no",
      item.emailError,
      item.notes,
    ]
      .map((value) => csvEscape(String(value ?? "")))
      .join(","),
  );
  return `\uFEFF${headers.join(",")}\n${lines.join("\n")}`;
}

export async function GET(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const items = listInquiries();
  const format = new URL(request.url).searchParams.get("format");
  if (format === "csv") {
    return new NextResponse(toCsv(items), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="code-colleagues-inquiries.csv"',
      },
    });
  }

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Could not read that form." }, { status: 400 });
  }

  const parsed = validateInquiry(body, { messageRequired: false });
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const inquiry = await addInquiry({
    ...parsed.value,
    source: "admin",
    status: "enrolled",
    notes: "",
    emailSent: false,
    emailError: "",
  });

  return NextResponse.json({ item: inquiry });
}
