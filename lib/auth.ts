// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import type { Role } from "@prisma/client";

// Permetti di configurare i domini consentiti via env, fallback a lista hardcoded
function getAllowedDomains(): string[] {
  const fromEnv = process.env.STAFF_ALLOWED_EMAIL_DOMAINS; // es: "@virtese.com,@restaurant.local"
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ["@virtese.com", "@restaurant.local"];
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
}

// Tipi helper locali per estendere token/session senza usare `any`
type TokenWithRole = {
  role?: Role;
  uid?: string;
};

type SessionUserWithRole = {
  id?: string;
  role?: Role;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT per leggere il ruolo in middleware

  providers: [
    EmailProvider({
      from: process.env.SMTP_FROM!,
      maxAge: 60 * 30, // 30 minuti per il magic link
      async sendVerificationRequest({ identifier, url, provider }) {
        const transport = getTransport();
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: "Sign in to Virtese Restaurant",
          html: `<p>Click to sign in:</p><p><a href="${url}">Sign in</a></p>`,
          text: `Sign in: ${url}`,
        });
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },

  callbacks: {
    // ⛔️ Restringi il sign-in ai domini consentiti (staff only)
    async signIn({ user }) {
      const allowed = getAllowedDomains();
      const email = user?.email ?? "";
      // consenti se l'email termina con uno dei domini
      const ok = allowed.some((dom) =>
        email.toLowerCase().endsWith(dom.toLowerCase())
      );
      return ok; // true = consenti, false = blocca
    },

    // ✅ Copia role/id nel JWT
    async jwt({ token, user }) {
      const t = token as typeof token & TokenWithRole;

      if (user) {
        // `user` qui è il record dal DB al primo login
        const dbUser = user as { id: string; role?: Role | null };
        t.role = dbUser.role ?? "STAFF";
        t.uid = dbUser.id;
      } else if (!t.role && token.email) {
        // Primo passaggio dopo refresh, recupera dal DB
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        t.role = dbUser?.role ?? "STAFF";
        t.uid = dbUser?.id;
      }

      return t;
    },

    // ✅ Espone role/id sulla sessione
    async session({ session, token }) {
      const t = token as typeof token & TokenWithRole;
      const s = session as typeof session & {
        role?: Role;
        user?: typeof session.user & SessionUserWithRole;
      };

      s.role = t.role;
      if (s.user) {
        s.user.id = t.uid;
        s.user.role = t.role;
      }

      return s;
    },
  },

  debug: false,
};
