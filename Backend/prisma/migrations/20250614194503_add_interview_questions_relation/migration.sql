   -- Add createdById column as nullable
   ALTER TABLE "questions" ADD COLUMN "createdById" TEXT;

   -- Update existing rows with a valid user ID (replace 'some-user-id' with an actual user ID)
   UPDATE "questions" SET "createdById" = 'some-user-id' WHERE "createdById" IS NULL;

   -- Make the column required
   ALTER TABLE "questions" ALTER COLUMN "createdById" SET NOT NULL;