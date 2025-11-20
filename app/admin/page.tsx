import { redirect } from "next/navigation";
import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";

export default async function AdminHome() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  redirect("/admin/studio");
}
