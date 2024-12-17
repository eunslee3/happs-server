/*
  Warnings:

  - You are about to drop the column `content` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mediaUrl]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Made the column `mediaUrl` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "content",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ALTER COLUMN "mediaUrl" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_mediaUrl_key" ON "Post"("mediaUrl");
