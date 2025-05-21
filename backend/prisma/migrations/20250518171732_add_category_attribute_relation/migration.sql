/*
  Warnings:

  - You are about to drop the column `required` on the `CategoryAttribute` table. All the data in the column will be lost.
  - You are about to drop the `CustomAttribute` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomAttribute" DROP CONSTRAINT "CustomAttribute_product_id_fkey";

-- AlterTable
ALTER TABLE "CategoryAttribute" DROP COLUMN "required";

-- DropTable
DROP TABLE "CustomAttribute";
