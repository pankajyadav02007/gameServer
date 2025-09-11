-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('WAITING', 'PLAYING', 'LEFT', 'FINISHED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profilePhoto" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxPlayer" INTEGER NOT NULL,
    "minPlayer" INTEGER NOT NULL,
    "thumbnail" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."playerGameProfile" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "Highscore" INTEGER NOT NULL DEFAULT 0,
    "totalPlayedTime" INTEGER NOT NULL DEFAULT 0,
    "gameCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "playerGameProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSession" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "Status" "public"."Status" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gameSessionPlayer" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gameSessionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "playerGameProfile_gameId_playerId_key" ON "public"."playerGameProfile"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "public"."playerGameProfile" ADD CONSTRAINT "playerGameProfile_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."playerGameProfile" ADD CONSTRAINT "playerGameProfile_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSession" ADD CONSTRAINT "GameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gameSessionPlayer" ADD CONSTRAINT "gameSessionPlayer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gameSessionPlayer" ADD CONSTRAINT "gameSessionPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
