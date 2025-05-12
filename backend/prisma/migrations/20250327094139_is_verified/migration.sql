/*
  Warnings:

  - Changed the type of `is_verified` on the `Users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "is_verified",
ADD COLUMN     "is_verified" BOOLEAN NOT NULL;
