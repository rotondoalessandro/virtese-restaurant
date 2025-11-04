/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `MenuCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[weekday]` on the table `OpeningHour` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_name_key" ON "MenuCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningHour_weekday_key" ON "OpeningHour"("weekday");
