import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  await prisma.user.upsert({
    where: { email: "owner@restaurant.local" },
    update: { role: Role.OWNER, name: "Owner" },
    create: {
      email: "owner@restaurant.local",
      name: "Owner",
      role: Role.OWNER,
    },
  });

  console.log("Seed complete: ensured owner@restaurant.local exists");
}

run()
  .catch((e) => {
    console.error("Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
