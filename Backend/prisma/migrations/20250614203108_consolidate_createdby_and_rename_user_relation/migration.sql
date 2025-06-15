/*
  Warnings:

  - You are about to drop the column `createdBy` on the `questions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_createdBy_fkey";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "createdBy";

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
