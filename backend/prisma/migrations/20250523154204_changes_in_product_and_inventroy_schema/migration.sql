/*
  Warnings:

  - You are about to drop the column `color_family` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `color_name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ArchivedOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ArchivedProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariationInventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToVariationInventory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PARENT', 'VARIANT');

-- DropForeignKey
ALTER TABLE "ProductVariation" DROP CONSTRAINT "ProductVariation_product_id_fkey";

-- DropForeignKey
ALTER TABLE "VariationInventory" DROP CONSTRAINT "VariationInventory_variation_id_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToVariationInventory" DROP CONSTRAINT "_ProductToVariationInventory_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToVariationInventory" DROP CONSTRAINT "_ProductToVariationInventory_B_fkey";

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "reserved_quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "color_family",
DROP COLUMN "color_name",
DROP COLUMN "gender",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "product_type" "ProductType" NOT NULL DEFAULT 'PARENT',
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "ArchivedOrder";

-- DropTable
DROP TABLE "ArchivedProduct";

-- DropTable
DROP TABLE "ProductVariation";

-- DropTable
DROP TABLE "VariationInventory";

-- DropTable
DROP TABLE "_ProductToVariationInventory";

-- CreateTable
CREATE TABLE "ProductHistory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductHistory_user_id_product_id_key" ON "ProductHistory"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductHistory" ADD CONSTRAINT "ProductHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductHistory" ADD CONSTRAINT "ProductHistory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
