-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "approvalStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- Update existing users to be approved (for migration purposes)
UPDATE "public"."users" SET "approvalStatus" = 'APPROVED', "approvalDate" = CURRENT_TIMESTAMP WHERE "approvalStatus" = 'PENDING';