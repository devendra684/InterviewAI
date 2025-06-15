/*
  Warnings:

  - You are about to drop the `_InterviewToQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_InterviewToQuestion" DROP CONSTRAINT "_InterviewToQuestion_A_fkey";

-- DropForeignKey
ALTER TABLE "_InterviewToQuestion" DROP CONSTRAINT "_InterviewToQuestion_B_fkey";

-- DropTable
DROP TABLE "_InterviewToQuestion";

-- CreateTable
CREATE TABLE "_InterviewQuestions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InterviewQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InterviewQuestions_B_index" ON "_InterviewQuestions"("B");

-- AddForeignKey
ALTER TABLE "_InterviewQuestions" ADD CONSTRAINT "_InterviewQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewQuestions" ADD CONSTRAINT "_InterviewQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
