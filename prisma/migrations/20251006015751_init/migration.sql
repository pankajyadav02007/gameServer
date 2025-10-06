/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Roles" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "Role" "public"."Roles" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "public"."Role";
