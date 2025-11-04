// types/next-auth.d.ts
import NextAuth from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    role?: Role;
    user: {
      id?: string;
      role?: Role;
    } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
  }
}
