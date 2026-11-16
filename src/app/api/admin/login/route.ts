import { NextResponse } from "next/server";
import { emailOk, loginLimited, passwordOk, SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { clientIp } from "@/lib/request";

export async function POST(request: Request) {
  if (loginLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Wait 15 minutes and try again." },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  if (!emailOk(body.email || "") || !passwordOk(body.password || "")) {
    return NextResponse.json({ error: "That email or password is not correct." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, signSession(), sessionCookieOptions());
  return response;
}
