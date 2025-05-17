/*
  Warnings:

  - You are about to drop the column `level` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `Category` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parent_id_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "level",
DROP COLUMN "parent_id",
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;
