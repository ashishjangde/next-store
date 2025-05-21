/*
  Warnings:

  - You are about to drop the column `sort_order` on the `AttributeValue` table. All the data in the column will be lost.
  - You are about to drop the column `sort_order` on the `Category` table. All the data in the column will be lost.
  - The `size` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `stock` on the `ProductVariation` table. All the data in the column will be lost.
  - You are about to drop the `ApparelDetails` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[product_id]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `size` on the `ProductVariation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ApparelDetails" DROP CONSTRAINT "ApparelDetails_product_id_fkey";

-- AlterTable
ALTER TABLE "AttributeValue" DROP COLUMN "sort_order";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "sort_order",
ADD COLUMN     "parent_id" TEXT;

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "low_stock_threshold" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archived_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variation_id" TEXT,
DROP COLUMN "size",
ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "ProductVariation" DROP COLUMN "stock",
DROP COLUMN "size",
ADD COLUMN     "size" TEXT NOT NULL;

-- DropTable
DROP TABLE "ApparelDetails";

-- DropEnum
DROP TYPE "FabricCare";

-- DropEnum
DROP TYPE "FabricType";

-- DropEnum
DROP TYPE "FitType";

-- DropEnum
DROP TYPE "NeckType";

-- DropEnum
DROP TYPE "Occasion";

-- DropEnum
DROP TYPE "PatternType";

-- DropEnum
DROP TYPE "Size";

-- DropEnum
DROP TYPE "SleeveType";

-- CreateTable
CREATE TABLE "CategoryAttribute" (
    "category_id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CategoryAttribute_pkey" PRIMARY KEY ("category_id","attribute_id")
);

-- CreateTable
CREATE TABLE "VariationInventory" (
    "id" TEXT NOT NULL,
    "variation_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VariationInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedProduct" (
    "id" TEXT NOT NULL,
    "original_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedOrder" (
    "id" TEXT NOT NULL,
    "original_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToVariationInventory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToVariationInventory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "VariationInventory_variation_id_key" ON "VariationInventory"("variation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivedProduct_original_id_key" ON "ArchivedProduct"("original_id");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivedOrder_original_id_key" ON "ArchivedOrder"("original_id");

-- CreateIndex
CREATE INDEX "_ProductToVariationInventory_B_index" ON "_ProductToVariationInventory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_product_id_key" ON "Inventory"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariation_product_id_size_color_key" ON "ProductVariation"("product_id", "size", "color");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAttribute" ADD CONSTRAINT "CategoryAttribute_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAttribute" ADD CONSTRAINT "CategoryAttribute_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariationInventory" ADD CONSTRAINT "VariationInventory_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "ProductVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToVariationInventory" ADD CONSTRAINT "_ProductToVariationInventory_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToVariationInventory" ADD CONSTRAINT "_ProductToVariationInventory_B_fkey" FOREIGN KEY ("B") REFERENCES "VariationInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
