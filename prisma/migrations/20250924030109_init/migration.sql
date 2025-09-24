/*
  Warnings:

  - You are about to drop the column `CreateAt` on the `GameSession` table. All the data in the column will be lost.
  - Added the required column `CreatedAt` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."GameSession" DROP COLUMN "CreateAt",
ADD COLUMN     "CreatedAt" TIMESTAMP(3) NOT NULL;
