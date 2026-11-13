import fs from "fs";
import path from "path";
import type { Inquiry } from "./types";

const file = path.join(process.cwd(), "data", "inquiries.json");

function read(): Inquiry[] {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Inquiry[]) : [];
  } catch {
    return [];
  }
}

function write(items: Inquiry[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(items, null, 2), "utf8");
}

let chain: Promise<unknown> = Promise.resolve();

function mutate<T>(fn: (items: Inquiry[]) => { items: Inquiry[]; result: T }): Promise<T> {
  const run = chain.then(() => {
    const current = read();
    const { items, result } = fn(current);
    write(items);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function listInquiries() {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getInquiry(id: string) {
  return read().find((item) => item.id === id) ?? null;
}

export function addInquiry(input: Omit<Inquiry, "id" | "createdAt">) {
  const inquiry: Inquiry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  return mutate((items) => ({ items: [inquiry, ...items], result: inquiry }));
}

export function updateInquiry(id: string, patch: Partial<Inquiry>) {
  return mutate((items) => {
    let updated: Inquiry | null = null;
    const next = items.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch, id: item.id, createdAt: item.createdAt };
      return updated;
    });
    return { items: next, result: updated };
  });
}

export function removeInquiry(id: string) {
  return mutate((items) => ({
    items: items.filter((item) => item.id !== id),
    result: items.some((item) => item.id === id),
  }));
}
