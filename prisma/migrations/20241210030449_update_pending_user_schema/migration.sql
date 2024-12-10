/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `PendingUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PendingUser" ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_phoneNumber_key" ON "PendingUser"("phoneNumber");
