-- AlterTable
ALTER TABLE "PendingUser" ADD COLUMN     "amountOfVerificationTokensSent" INTEGER DEFAULT 0,
ADD COLUMN     "numberOfTimeouts" INTEGER DEFAULT 0,
ALTER COLUMN "attempts" SET DEFAULT 0;
