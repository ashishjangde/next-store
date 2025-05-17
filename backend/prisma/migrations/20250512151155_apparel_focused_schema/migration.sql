/*
  Warnings:

  - You are about to drop the column `material` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApparelDetails" ADD COLUMN     "closure_type" TEXT,
ADD COLUMN     "fabric_composition" TEXT,
ADD COLUMN     "hem_type" TEXT,
ADD COLUMN     "lining" BOOLEAN,
ADD COLUMN     "rise_type" TEXT,
ADD COLUMN     "stretch_type" TEXT,
ADD COLUMN     "style_code" TEXT,
ADD COLUMN     "sustainable" BOOLEAN,
ADD COLUMN     "transparency" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "material",
ADD COLUMN     "color_family" TEXT,
ADD COLUMN     "color_name" TEXT;
