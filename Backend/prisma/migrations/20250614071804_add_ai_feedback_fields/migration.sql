/*
  Warnings:

  - You are about to drop the column `codeQuality` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `communication` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `detailedFeedback` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `problemSolving` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `timeManagement` on the `feedback` table. All the data in the column will be lost.
  - Added the required column `feedback` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performance` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_interviewId_fkey";

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "codeQuality",
DROP COLUMN "communication",
DROP COLUMN "detailedFeedback",
DROP COLUMN "problemSolving",
DROP COLUMN "timeManagement",
ADD COLUMN     "codeFeedbackSummary" TEXT,
ADD COLUMN     "communicationFeedbackSummary" TEXT,
ADD COLUMN     "feedback" TEXT NOT NULL,
ADD COLUMN     "performance" JSONB NOT NULL,
ADD COLUMN     "transcriptDetailedFeedback" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
