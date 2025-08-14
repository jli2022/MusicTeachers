-- Add approval status enum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Add approval columns to users table
ALTER TABLE "users" 
ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "approvedBy" TEXT,
ADD COLUMN "approvalDate" TIMESTAMP(3),
ADD COLUMN "rejectionReason" TEXT;

-- Update existing users to be APPROVED
UPDATE "users" SET "approvalStatus" = 'APPROVED', "approvalDate" = NOW() WHERE "approvalStatus" = 'PENDING';

-- Insert test users if they don't exist
INSERT INTO "users" ("id", "email", "name", "password", "role", "isActive", "approvalStatus", "approvalDate", "createdAt", "updatedAt")
SELECT 
    'test-pending-teacher-1', 
    'pending.teacher@test.com', 
    'Pending Teacher', 
    '$2b$12$example.hash.for.testing.only.password123', 
    'TEACHER', 
    true, 
    'PENDING', 
    NULL,
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'pending.teacher@test.com');

INSERT INTO "users" ("id", "email", "name", "password", "role", "isActive", "approvalStatus", "approvalDate", "createdAt", "updatedAt")
SELECT 
    'test-rejected-teacher-1', 
    'rejected.teacher@test.com', 
    'Rejected Teacher', 
    '$2b$12$example.hash.for.testing.only.password123', 
    'TEACHER', 
    true, 
    'REJECTED', 
    NOW(),
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'rejected.teacher@test.com');

-- Insert corresponding teacher profiles
INSERT INTO "teachers" ("id", "userId", "createdAt", "updatedAt")
SELECT 
    'test-pending-teacher-profile-1', 
    'test-pending-teacher-1',
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "teachers" WHERE "userId" = 'test-pending-teacher-1');

INSERT INTO "teachers" ("id", "userId", "createdAt", "updatedAt")
SELECT 
    'test-rejected-teacher-profile-1', 
    'test-rejected-teacher-1',
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "teachers" WHERE "userId" = 'test-rejected-teacher-1');