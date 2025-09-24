/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,playerId]` on the table `gameSessionPlayer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CreateAt` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."GameSession" ADD COLUMN     "CreateAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "GameUrl" TEXT,
ADD COLUMN     "ProcessID" INTEGER,
ADD COLUMN     "StartedAt" TIMESTAMP(3),
ADD COLUMN     "winner" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "gameSessionPlayer_sessionId_playerId_key" ON "public"."gameSessionPlayer"("sessionId", "playerId");
