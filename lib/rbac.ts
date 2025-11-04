import type { Role } from "@prisma/client"

// ruoli ammessi
export function hasRole(role: Role | undefined, allowed: Role[]) {
  return !!role && allowed.includes(role)
}
