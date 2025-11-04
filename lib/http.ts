// lib/http.ts
export function requireSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    if (origin && new URL(origin).origin !== new URL(host).origin) {
      return { ok: false as const, error: "Bad origin" };
    }
  } catch {}
  return { ok: true as const };
}