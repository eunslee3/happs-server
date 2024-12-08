/*
  Warnings:

  - You are about to drop the column `numberOfTimeouts` on the `PendingUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "numberOfTimeouts",
ADD COLUMN     "numberOfTimeoutsForAttempts" INTEGER DEFAULT 0,
ADD COLUMN     "numberOfTimeoutsForTokens" INTEGER DEFAULT 0;
