ALTER TABLE "User"
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "emailVerificationHash" TEXT,
ADD COLUMN "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN "passwordResetHash" TEXT,
ADD COLUMN "passwordResetExpires" TIMESTAMP(3);
