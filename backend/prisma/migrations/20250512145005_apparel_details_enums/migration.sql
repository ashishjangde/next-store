/*
  Warnings:

  - The `fabric_type` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fabric_care` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pattern` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fit_type` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `neck_type` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sleeve_type` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `occasion` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `country_of_origin` column on the `ApparelDetails` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FabricType" AS ENUM ('COTTON', 'POLYESTER', 'LINEN', 'SILK', 'WOOL', 'RAYON', 'DENIM', 'JERSEY', 'CHIFFON', 'SATIN', 'VELVET', 'LEATHER', 'SUEDE', 'NYLON', 'SPANDEX', 'MODAL', 'CASHMERE', 'FLEECE', 'TWILL', 'OTHER');

-- CreateEnum
CREATE TYPE "FabricCare" AS ENUM ('MACHINE_WASH', 'HAND_WASH', 'DRY_CLEAN', 'SPOT_CLEAN', 'AIR_DRY', 'TUMBLE_DRY', 'IRON_LOW', 'IRON_MEDIUM', 'IRON_HIGH', 'DO_NOT_IRON', 'DO_NOT_BLEACH', 'DO_NOT_TUMBLE_DRY', 'OTHER');

-- CreateEnum
CREATE TYPE "PatternType" AS ENUM ('SOLID', 'STRIPED', 'CHECKED', 'PLAID', 'FLORAL', 'POLKA_DOT', 'CHEVRON', 'GEOMETRIC', 'ANIMAL_PRINT', 'CAMOUFLAGE', 'PAISLEY', 'ABSTRACT', 'GRAPHIC', 'ETHNIC', 'OTHER');

-- CreateEnum
CREATE TYPE "FitType" AS ENUM ('SLIM', 'REGULAR', 'RELAXED', 'OVERSIZED', 'SKINNY', 'STRAIGHT', 'BOOTCUT', 'TAPERED', 'WIDE_LEG', 'ATHLETIC', 'BOXY', 'TAILORED', 'OTHER');

-- CreateEnum
CREATE TYPE "NeckType" AS ENUM ('CREW_NECK', 'V_NECK', 'ROUND_NECK', 'SCOOP_NECK', 'BOAT_NECK', 'TURTLE_NECK', 'MOCK_NECK', 'COLLARED', 'POLO', 'HENLEY', 'HALTER', 'COWL_NECK', 'OFF_SHOULDER', 'SWEETHEART', 'OTHER');

-- CreateEnum
CREATE TYPE "SleeveType" AS ENUM ('SLEEVELESS', 'SHORT_SLEEVE', 'THREE_QUARTER', 'LONG_SLEEVE', 'CAP_SLEEVE', 'ROLL_UP', 'BELL_SLEEVE', 'PUFF_SLEEVE', 'RAGLAN', 'DOLMAN', 'KIMONO', 'BATWING', 'DROP_SHOULDER', 'OTHER');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('CASUAL', 'FORMAL', 'BUSINESS', 'PARTY', 'WEDDING', 'SPORTS', 'BEACH', 'TRAVEL', 'FESTIVAL', 'LOUNGE', 'MATERNITY', 'WORKWEAR', 'NIGHT_OUT', 'EVERYDAY', 'OTHER');

-- CreateEnum
CREATE TYPE "CountryOfOrigin" AS ENUM ('INDIA', 'CHINA', 'BANGLADESH', 'VIETNAM', 'TURKEY', 'ITALY', 'USA', 'PAKISTAN', 'CAMBODIA', 'INDONESIA', 'THAILAND', 'MEXICO', 'ETHIOPIA', 'FRANCE', 'OTHER');

-- AlterTable
ALTER TABLE "ApparelDetails" ADD COLUMN     "manufacturing_date" TIMESTAMP(3),
ADD COLUMN     "wash_instruction" TEXT,
DROP COLUMN "fabric_type",
ADD COLUMN     "fabric_type" "FabricType",
DROP COLUMN "fabric_care",
ADD COLUMN     "fabric_care" "FabricCare",
DROP COLUMN "pattern",
ADD COLUMN     "pattern" "PatternType",
DROP COLUMN "fit_type",
ADD COLUMN     "fit_type" "FitType",
DROP COLUMN "neck_type",
ADD COLUMN     "neck_type" "NeckType",
DROP COLUMN "sleeve_type",
ADD COLUMN     "sleeve_type" "SleeveType",
DROP COLUMN "occasion",
ADD COLUMN     "occasion" "Occasion",
DROP COLUMN "country_of_origin",
ADD COLUMN     "country_of_origin" "CountryOfOrigin";
