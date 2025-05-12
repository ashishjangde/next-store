/*
  Warnings:

  - You are about to drop the column `accountStatus` on the `Users` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Roles" ADD VALUE 'SELLER';

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "accountStatus",
ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';
