// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { withAuth } from "next-auth/middleware";
import { ipFromRequest, rlHold, rlBook, rlWaitlist, rlCancel } from "@/lib/ratelimit";

// Protezione area /admin con NextAuth
const adminAuth = withAuth({
  pages: { signIn: "/auth/signin" },
  callbacks: {
    authorized: ({ token, req }) => {
      const p = req.nextUrl.pathname;
      if (p.startsWith("/admin")) {
        const role = (token as any)?.role;
        // scegli i ruoli consentiti
        return !!token && (role === "OWNER" || role === "MANAGER" || role === "HOST");
      }
      return !!token;
    },
  },
});

// Middleware unificato (rate limit + admin auth)
export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // ---- Rate limit API pubbliche ----
  if (pathname.startsWith("/api/")) {
    // consenti preflight CORS
    if (req.method.toUpperCase() === "OPTIONS") {
      return NextResponse.next();
    }

    if (req.method.toUpperCase() === "POST") {
      const ip = ipFromRequest(req);
      let result: { success: boolean; reset?: number } | null = null;

      if (pathname.startsWith("/api/hold/cancel")) {
        result = await rlCancel.limit(ip);
      } else if (pathname.startsWith("/api/hold")) {
        result = await rlHold.limit(ip);
      } else if (pathname.startsWith("/api/book")) {
        result = await rlBook.limit(ip);
      } else if (pathname.startsWith("/api/waitlist")) {
        result = await rlWaitlist.limit(ip);
      } else if (pathname.startsWith("/api/cancel")) {
        result = await rlCancel.limit(ip);
      }

      if (result && !result.success) {
        const res = NextResponse.json({ error: "Too many requests" }, { status: 429 });
        if (result.reset) {
          const retryAfter = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));
          res.headers.set("Retry-After", String(retryAfter));
        }
        return res;
      }
    }
    return NextResponse.next();
  }

  // ---- Area admin protetta ----
  if (pathname.startsWith("/admin")) {
    // ⬇️ Cast al tipo atteso da withAuth
    return adminAuth(req as unknown as NextRequestWithAuth, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API pubbliche da rate-limitare
    "/api/hold",
    "/api/hold/cancel",
    "/api/book",
    "/api/waitlist",
    "/api/cancel",

    // Area admin da proteggere
    "/admin/:path*",
  ],
};
