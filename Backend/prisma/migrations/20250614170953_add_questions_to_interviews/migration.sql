-- CreateTable
CREATE TABLE "_InterviewToQuestion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InterviewToQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InterviewToQuestion_B_index" ON "_InterviewToQuestion"("B");

-- AddForeignKey
ALTER TABLE "_InterviewToQuestion" ADD CONSTRAINT "_InterviewToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterviewToQuestion" ADD CONSTRAINT "_InterviewToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
