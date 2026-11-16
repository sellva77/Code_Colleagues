import fs from "fs";
import os from "os";
import path from "path";
import type { Inquiry } from "./types";

const durableFile = path.join(process.cwd(), "data", "inquiries.json");
const tempFile = path.join(os.tmpdir(), "code-colleagues-inquiries.json");

let memory: Inquiry[] | null = null;
let activeFile = durableFile;

function readFile(file: string): Inquiry[] | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? (parsed as Inquiry[]) : [];
  } catch {
    return null;
  }
}

function read(): Inquiry[] {
  if (memory) return memory;
  return readFile(activeFile) ?? readFile(durableFile) ?? readFile(tempFile) ?? [];
}

function write(items: Inquiry[]) {
  memory = items;
  const targets = activeFile === tempFile ? [tempFile, durableFile] : [durableFile, tempFile];
  for (const file of targets) {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(items, null, 2), "utf8");
      activeFile = file;
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EPERM" || code === "EACCES" || code === "ENOTDIR") continue;
      console.error("Could not save inquiries:", code || error);
      return;
    }
  }
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
