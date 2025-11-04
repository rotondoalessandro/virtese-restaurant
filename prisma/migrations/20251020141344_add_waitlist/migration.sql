-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateISO" TEXT NOT NULL,
    "partySize" INTEGER NOT NULL,
    "area" "Area",
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitlistEntry_dateISO_status_idx" ON "WaitlistEntry"("dateISO", "status");
