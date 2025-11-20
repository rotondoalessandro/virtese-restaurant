/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlackoutSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeatureFlag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpeningHour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromoCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReservationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpecialHour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscriber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Table` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WaitlistEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_customerId_fkey";

-- DropForeignKey
ALTER TABLE "BookingTable" DROP CONSTRAINT "BookingTable_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "BookingTable" DROP CONSTRAINT "BookingTable_tableId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "BlackoutSlot";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "BookingTable";

-- DropTable
DROP TABLE "Campaign";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "FeatureFlag";

-- DropTable
DROP TABLE "Invite";

-- DropTable
DROP TABLE "MenuCategory";

-- DropTable
DROP TABLE "MenuItem";

-- DropTable
DROP TABLE "OpeningHour";

-- DropTable
DROP TABLE "PromoCode";

-- DropTable
DROP TABLE "ReservationRule";

-- DropTable
DROP TABLE "SpecialHour";

-- DropTable
DROP TABLE "Subscriber";

-- DropTable
DROP TABLE "Table";

-- DropTable
DROP TABLE "WaitlistEntry";

-- DropEnum
DROP TYPE "Area";

-- DropEnum
DROP TYPE "BookingStatus";
