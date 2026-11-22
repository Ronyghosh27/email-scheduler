-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "failureReason" TEXT;

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "sess" SET DATA TYPE JSONB;
