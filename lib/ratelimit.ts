// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Un singolo client Redis, condiviso
export const redis = Redis.fromEnv();

// Costruisci istanze diverse per categorie di API
export const rlHold = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, "1 m"), // 8 richieste/min per IP
  prefix: "rl:hold",
  analytics: true,
});

export const rlBook = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // più stretto sul book
  prefix: "rl:book",
  analytics: true,
});

export const rlWaitlist = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(6, "1 m"),
  prefix: "rl:waitlist",
  analytics: true,
});

export const rlCancel = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(6, "1 m"),
  prefix: "rl:cancel",
  analytics: true,
});

export const rlContact = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"), // contact form is sensitive — stricter
  prefix: "rl:contact",
  analytics: true,
});

// Utility: estrae IP
export function ipFromRequest(req: Request) {
  // Vercel/Proxy: X-Forwarded-For
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  // Fallback
  return req.headers.get("x-real-ip") || "0.0.0.0";
}
