/*
  Warnings:

  - You are about to drop the column `timeout` on the `PendingUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "timeout",
ADD COLUMN     "timeoutForAttempts" TIMESTAMP(3),
ADD COLUMN     "timeoutForToken" TIMESTAMP(3);
