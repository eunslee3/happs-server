-- AlterTable
ALTER TABLE "PendingUser" ADD COLUMN     "attempts" INTEGER,
ADD COLUMN     "timeout" TIMESTAMP(3);
