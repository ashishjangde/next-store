/*
  Warnings:

  - The `country_of_origin` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ApparelDetails" DROP COLUMN "country_of_origin",
ADD COLUMN     "country_of_origin" TEXT NOT NULL DEFAULT 'INDIA';

-- DropEnum
DROP TYPE "CountryOfOrigin";
