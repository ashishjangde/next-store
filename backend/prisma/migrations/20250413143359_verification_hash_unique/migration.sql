/*
  Warnings:

  - A unique constraint covering the columns `[vefification_hash]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Users_vefification_hash_key" ON "Users"("vefification_hash");
