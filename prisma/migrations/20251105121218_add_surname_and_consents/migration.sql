-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "consentUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "privacyConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profilingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "surname" TEXT;
