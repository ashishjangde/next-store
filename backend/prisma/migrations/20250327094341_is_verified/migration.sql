-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "verification_code" DROP NOT NULL,
ALTER COLUMN "verification_code_expire_at" DROP NOT NULL;
