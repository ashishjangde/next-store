-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "incorect_attempt" INTEGER,
ADD COLUMN     "retry_timestamp" TIMESTAMP(3),
ADD COLUMN     "vefification_hash" TEXT;
