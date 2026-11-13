export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "local";
  return request.headers.get("x-real-ip") || "local";
}

const formHits = new Map<string, number[]>();

export function formLimited(ip: string) {
  const now = Date.now();
  const recent = (formHits.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (recent.length >= 5) {
    formHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  formHits.set(ip, recent);
  return false;
}
