-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_positionId_fkey";

-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_createdBy_fkey";

-- DropTable
DROP TABLE "questions";

-- DropTable
DROP TABLE "positions"; 