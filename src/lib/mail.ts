import https from "node:https";
import nodemailer from "nodemailer";
import { business, mailRecipients } from "./business";
import type { Inquiry } from "./types";

export function smtpPassword() {
  return (process.env.SMTP_PASS || "").replace(/\s+/g, "");
}

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && smtpPassword());
}

export function recipientList() {
  const configured = (process.env.MAIL_TO || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : mailRecipients;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

function inquiryText(inquiry: Inquiry) {
  return [
    `New project inquiry for ${business.name}`,
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email || "—"}`,
    `Phone: ${inquiry.phone || "—"}`,
    `Business: ${inquiry.company || "—"}`,
    `Need: ${inquiry.service}`,
    `Source: ${inquiry.source === "admin" ? "Added in admin" : "Website form"}`,
    "",
    inquiry.message || "(No message)",
    "",
    inquiry.email ? "Reply to this email to answer the client." : "No email was given. Reach the client by phone.",
  ].join("\n");
}

function inquiryHtml(inquiry: Inquiry) {
  const rows = [
    ["Name", inquiry.name],
    ["Email", inquiry.email || "—"],
    ["Phone", inquiry.phone || "—"],
    ["Business", inquiry.company || "—"],
    ["Need", inquiry.service],
    ["Source", inquiry.source === "admin" ? "Added in admin" : "Website form"],
  ];
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#5c675f;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return `<div style="font-family:Georgia,serif;color:#17211c;line-height:1.5">
    <p style="letter-spacing:.16em;font-size:12px;margin:0 0 8px">CODE COLLEAGUES</p>
    <h1 style="font-size:24px;font-weight:500;margin:0 0 16px">New inquiry from ${escapeHtml(inquiry.name)}</h1>
    <table style="border-collapse:collapse;font-family:Segoe UI,sans-serif;font-size:15px">${body}</table>
    <p style="font-family:Segoe UI,sans-serif;font-size:15px;white-space:pre-wrap;margin-top:18px">${escapeHtml(inquiry.message || "(No message)")}</p>
    <p style="font-family:Segoe UI,sans-serif;font-size:13px;color:#5c675f">${inquiry.email ? "Reply to this email to reach the client." : "No email was given. Reach the client by phone."} This copy was sent to both studio inboxes.</p>
  </div>`;
}

function transporter() {
  const user = process.env.SMTP_USER || business.emailBusiness;
  return {
    user,
    mailer: nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user, pass: smtpPassword() },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    }),
  };
}

function postForm(url: string, origin: string, body: string) {
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    const target = new URL(url);
    const req = https.request(
      {
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(body),
          Origin: origin,
          Referer: `${origin}/`,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode || 0, text: Buffer.concat(chunks).toString("utf8") });
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function sendViaFormInbox(inquiry: Inquiry, origin: string) {
  const recipients = recipientList();
  const primary =
    recipients.find((address) => address.toLowerCase() === business.emailBusiness.toLowerCase()) || recipients[0];
  const copies = recipients.filter((address) => address.toLowerCase() !== primary.toLowerCase());
  const body = JSON.stringify({
    Name: inquiry.name,
    Email: inquiry.email || "—",
    Phone: inquiry.phone || "—",
    "Business name": inquiry.company || "—",
    "What do you need": inquiry.service,
    "About the project": inquiry.message || "(No message)",
    _subject: `Enrollment from ${inquiry.name}`,
    _template: "table",
    _captcha: "false",
    _cc: copies.join(","),
    ...(inquiry.email ? { _replyto: inquiry.email } : {}),
  });
  const response = await postForm(`https://formsubmit.co/ajax/${encodeURIComponent(primary)}`, origin, body);
<<<<<<< HEAD
  let payload: { success?: string | boolean; message?: string } = {};
  try {
    payload = JSON.parse(response.text || "{}") as { success?: string | boolean; message?: string };
  } catch {
    payload = { message: response.text.slice(0, 180) || "The enrollment email was not accepted." };
  }
=======
  const payload = JSON.parse(response.text || "{}") as { success?: string | boolean; message?: string };
>>>>>>> 29f8b522bc02bd1a600d5a8b081d0fe70cb767ea
  const accepted = payload.success === true || payload.success === "true";
  if (response.status < 200 || response.status >= 300 || !accepted) {
    throw new Error(payload.message || "The enrollment email was not accepted.");
  }
}

export async function sendInquiryEmail(inquiry: Inquiry, origin = "http://localhost:3000") {
  if (mailConfigured()) {
    const { user, mailer } = transporter();
    await mailer.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || business.name}" <${user}>`,
      to: recipientList(),
      ...(inquiry.email ? { replyTo: inquiry.email } : {}),
      subject: `New enrollment: ${inquiry.service} from ${inquiry.name}`,
      text: inquiryText(inquiry),
      html: inquiryHtml(inquiry),
    });
    return;
  }

  await sendViaFormInbox(inquiry, origin);
}

export async function sendClientReply(inquiry: Inquiry, subject: string, message: string) {
  if (!mailConfigured()) {
    throw new Error("Email is not set up yet. Add the Gmail app password in .env.local.");
  }
  if (!inquiry.email) {
    throw new Error("This inquiry has no email address to reply to.");
  }

  const { user, mailer } = transporter();
  const fromName = process.env.MAIL_FROM_NAME || business.name;
  const copies = recipientList().filter((address) => address.toLowerCase() !== inquiry.email.toLowerCase());
  const text = [
    `Hello ${inquiry.name},`,
    "",
    message,
    "",
    "— Code Colleagues",
    user,
    "",
    "You can reply to this email and it will come straight back to the studio.",
  ].join("\n");
  const html = `<div style="font-family:Segoe UI,sans-serif;color:#17211c;line-height:1.55;font-size:15px">
    <p style="letter-spacing:.16em;font-size:12px;margin:0 0 8px">CODE COLLEAGUES</p>
    <p>Hello ${escapeHtml(inquiry.name)},</p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    <p>— Code Colleagues<br>${escapeHtml(user)}</p>
    <p style="color:#5c675f;font-size:13px">You can reply to this email and it will come straight back to the studio.</p>
  </div>`;

  await mailer.sendMail({
    from: `"${fromName}" <${user}>`,
    to: inquiry.email,
    replyTo: user,
    bcc: copies.length > 0 ? copies : undefined,
    subject,
    text,
    html,
  });
}

export async function sendTestEmail() {
  if (!mailConfigured()) {
    throw new Error("Email is not set up yet. Add the Gmail app password in .env.local.");
  }
  const { user, mailer } = transporter();
  await mailer.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || business.name}" <${user}>`,
    to: recipientList(),
    subject: "Code Colleagues test email",
    text: `This is a test from the Code Colleagues website. If you can read it, inquiries will arrive in this inbox.\n\nSent to: ${recipientList().join(", ")}`,
    html: `<div style="font-family:Segoe UI,sans-serif;color:#17211c"><p>This is a test from the Code Colleagues website.</p><p>If you can read it, client inquiries will arrive in this inbox.</p><p>Sent to: ${recipientList().map(escapeHtml).join(", ")}</p></div>`,
  });
}
