import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getRole() {
  const session = await getServerSession(authOptions);
  // role viene aggiunto nel callback di NextAuth (non tipizzato ufficialmente)
  return (session?.role ?? undefined) as Role | undefined;
}

/** Throw se il ruolo non è consentito (per Server Actions). */
export async function assertRole(allowed: Role[]) {
  const role = await getRole();
  if (!role || !allowed.includes(role)) {
    throw new Error("Not authorized");
  }
}

/** Redirect se non autorizzato (per Server Components / pagine). */
export async function requireRole(allowed: Role[], to = "/auth/signin") {
  const role = await getRole();
  if (!role || !allowed.includes(role)) redirect(to);
}
