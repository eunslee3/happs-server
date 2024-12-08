/*
  Warnings:

  - You are about to drop the column `password` on the `PendingUser` table. All the data in the column will be lost.
  - Added the required column `hashedPassword` to the `PendingUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "password",
ADD COLUMN     "hashedPassword" TEXT NOT NULL;
