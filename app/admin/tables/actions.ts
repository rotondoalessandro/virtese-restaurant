import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Area, Prisma, Role } from "@prisma/client";
import { assertRole } from "@/lib/authz";

/** Crea un tavolo */
export async function createTableAction(formData: FormData) {
  "use server";
  await assertRole([Role.OWNER, Role.MANAGER]);

  const code = String(formData.get("code") || "").trim();
  const capacity = Number(formData.get("capacity") || 2);
  const area = (String(formData.get("area") || "INDOOR") as Area) ?? "INDOOR";
  const mergeGroup = (String(formData.get("mergeGroup") || "").trim() || null);

  if (!code) throw new Error("Code is required");
  if (capacity < 1) throw new Error("Capacity must be >= 1");

  try {
    await prisma.table.create({
      data: { code, capacity, area, mergeGroup, active: true },
    });
  } catch (e: unknown) {
    // P2002 = unique violation (code)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error(`Table code "${code}" already exists`);
    }
    throw e;
  }

  revalidatePath("/admin/tables");
}

/** Disattiva/attiva un tavolo con controlli di sicurezza */
export async function toggleActiveAction(id: string, nextActive: boolean) {
  "use server";

  await assertRole([Role.OWNER, Role.MANAGER]);

  if (nextActive === false) {
    // Blocca disattivazione se ci sono prenotazioni future su questo tavolo
    const now = new Date();
    const futureCount = await prisma.bookingTable.count({
      where: {
        tableId: id,
        booking: {
          status: { in: ["PENDING", "CONFIRMED"] },
          dateTime: { gte: now },
        },
      },
    });
    if (futureCount > 0) {
      throw new Error(
        "Cannot deactivate: this table has future reservations. Reassign or cancel them first."
      );
    }
  }

  await prisma.table.update({ where: { id }, data: { active: nextActive } });
  revalidatePath("/admin/tables");
}

/** Cancella definitivamente un tavolo (solo se mai usato) */
export async function deleteTableAction(id: string) {
  "use server";

  await assertRole([Role.OWNER, Role.MANAGER]);

  // Non cancellare se esistono allocazioni (passate o future): preserva storico
  const used = await prisma.bookingTable.count({ where: { tableId: id } });
  if (used > 0) {
    throw new Error(
      "Cannot delete: this table is referenced by reservations. Set it inactive instead."
    );
  }

  await prisma.table.delete({ where: { id } });
  revalidatePath("/admin/tables");
}

/** Aggiorna metadati tavolo (code/capacity/area/mergeGroup) */
export async function updateTableAction(id: string, formData: FormData) {
  "use server";
  await assertRole([Role.OWNER, Role.MANAGER]);

  const code = String(formData.get("code") || "").trim();
  const capacity = Number(formData.get("capacity") || 2);
  const area = (String(formData.get("area") || "INDOOR") as Area) ?? "INDOOR";
  const mergeGroup = (String(formData.get("mergeGroup") || "").trim() || null);

  if (!code) throw new Error("Code is required");
  if (capacity < 1) throw new Error("Capacity must be >= 1");

  try {
    await prisma.table.update({
      where: { id },
      data: { code, capacity, area, mergeGroup },
    });
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error(`Table code "${code}" already exists`);
    }
    throw e;
  }

  revalidatePath("/admin/tables");
}
