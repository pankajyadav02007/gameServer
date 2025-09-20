/*
  Warnings:

  - You are about to drop the column `TokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "TokenExpiry",
ADD COLUMN     "tokenExpiry" TIMESTAMP(3);
