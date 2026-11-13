import { serviceOptions } from "./business";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanLine(input: unknown, max: number) {
  return String(input ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanMessage(input: unknown) {
  return String(input ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, 4000);
}

export function validEmail(email: string) {
  return email.length <= 120 && emailRe.test(email);
}

export function validPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function validService(service: string) {
  return (serviceOptions as readonly string[]).includes(service);
}

export type InquiryInput = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
};

export function validateInquiry(
  body: Record<string, unknown>,
  options: { messageRequired: boolean },
): { error: string } | { value: InquiryInput } {
  const name = cleanLine(body.name, 80);
  const email = cleanLine(body.email, 120).toLowerCase();
  const phone = cleanLine(body.phone, 24);
  const company = cleanLine(body.company, 80);
  const service = cleanLine(body.service, 80);
  const message = cleanMessage(body.message);

  if (name.length < 2) return { error: "Please enter your name." };
  if (email && !validEmail(email)) return { error: "Please enter a valid email address." };
  if (!validPhone(phone)) return { error: "Please enter a valid phone number." };
  if (!validService(service)) return { error: "Please choose what you need." };
  if (options.messageRequired && message.length < 10) {
    return { error: "Please tell us a little more about the project (at least a sentence)." };
  }

  return { value: { name, email, phone, company, service, message } };
}
