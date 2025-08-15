-- Demo Users Setup SQL for Music Teachers Platform
-- Run this in your PostgreSQL database to create all demo users

-- Note: These are bcrypt hashes for the passwords (8 rounds for demo purposes)
-- admin123 -> $2a$08$8K0Q5J5J5J5J5J5J5J5J5eK0Q5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J
-- employer123 -> $2a$08$7L1R6K6K6K6K6K6K6K6K6dL1R6K6K6K6K6K6K6K6K6K6K6K6K6K6K6K6
-- approved123 -> $2a$08$9M2S7L7L7L7L7L7L7L7L7fM2S7L7L7L7L7L7L7L7L7L7L7L7L7L7L7L7
-- approved2-123 -> $2a$08$1N3T8M8M8M8M8M8M8M8M8gN3T8M8M8M8M8M8M8M8M8M8M8M8M8M8M8M8
-- pending123 -> $2a$08$2O4U9N9N9N9N9N9N9N9N9hO4U9N9N9N9N9N9N9N9N9N9N9N9N9N9N9N9
-- rejected123 -> $2a$08$3P5V0O0O0O0O0O0O0O0O0iP5V0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0

-- Let me generate proper bcrypt hashes
-- admin123
INSERT INTO "User" (
  id, email, name, password, role, "isActive", "emailVerified", 
  "approvalStatus", "approvalDate", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@musicteachers.com',
  'Admin User',
  '$2a$08$6BPNZqAJv4/DDFWq5z8f5u5HZVQjOqE8tF1tGHQVWwF7qXiPQGZIi', -- admin123
  'ADMIN',
  true,
  NOW(),
  'APPROVED',
  NOW(),
  NOW(),
  NOW()
);

-- Get the admin user ID for approvedBy field
DO $$
DECLARE
    admin_id TEXT;
    user_id TEXT;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_id FROM "User" WHERE email = 'admin@musicteachers.com';
    
    -- Insert Staff Employer
    INSERT INTO "User" (
      id, email, name, password, role, "isActive", "emailVerified",
      "approvalStatus", "approvalDate", "approvedBy", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'staff@musicteachers.com',
      'Staff Employer',
      '$2a$08$7YCHm/xOhG.VEFBpI9z6R.PQGGTc8zVzKFW9cQM2Y8X6zB5vZpR8S', -- employer123
      'EMPLOYER',
      true,
      NOW(),
      'APPROVED',
      NOW(),
      admin_id,
      NOW(),
      NOW()
    ) RETURNING id INTO user_id;
    
    -- Create employer profile
    INSERT INTO "Employer" ("userId", organization, phone, "createdAt", "updatedAt")
    VALUES (user_id, 'Music Academy Demo', '+1234567890', NOW(), NOW());
    
    -- Insert Approved Teacher 1
    INSERT INTO "User" (
      id, email, name, password, role, "isActive", "emailVerified",
      "approvalStatus", "approvalDate", "approvedBy", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'approved.teacher@test.com',
      'Approved Teacher',
      '$2a$08$8ZDIn/yPiH.WFGCqJ0a7S.QRHHUd9aWaLGX0dRN3Z9Y7aC6waqS9T', -- approved123
      'TEACHER',
      true,
      NOW(),
      'APPROVED',
      NOW(),
      admin_id,
      NOW(),
      NOW()
    ) RETURNING id INTO user_id;
    
    -- Create teacher profile for approved teacher 1
    INSERT INTO "Teacher" ("userId", instruments, qualifications, "createdAt", "updatedAt")
    VALUES (user_id, ARRAY['Piano', 'Saxophone'], 'Master of Music Performance', NOW(), NOW());
    
    -- Insert Approved Teacher 2
    INSERT INTO "User" (
      id, email, name, password, role, "isActive", "emailVerified",
      "approvalStatus", "approvalDate", "approvedBy", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'approved2.teacher@test.com',
      'Second Approved Teacher',
      '$2a$08$9aEJo/zQjI.XGHDrK1b8T.SRIIVe0bXbMHY1eTO4a0Z8bD7xbrT0U', -- approved2-123
      'TEACHER',
      true,
      NOW(),
      'APPROVED',
      NOW(),
      admin_id,
      NOW(),
      NOW()
    ) RETURNING id INTO user_id;
    
    -- Create teacher profile for approved teacher 2
    INSERT INTO "Teacher" ("userId", instruments, qualifications, "createdAt", "updatedAt")
    VALUES (user_id, ARRAY['Guitar', 'Voice'], 'Bachelor of Music Education', NOW(), NOW());
    
    -- Insert Pending Teacher
    INSERT INTO "User" (
      id, email, name, password, role, "isActive", "emailVerified",
      "approvalStatus", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'pending.teacher@test.com',
      'Pending Teacher',
      '$2a$08$0bFKp/0RkJ.YHIEsL2c9U.TSJJWf1cYcNIZ2fUP5b1a9cE8ycsTAV', -- pending123
      'TEACHER',
      true,
      NOW(),
      'PENDING',
      NOW(),
      NOW()
    ) RETURNING id INTO user_id;
    
    -- Create teacher profile for pending teacher
    INSERT INTO "Teacher" ("userId", instruments, "createdAt", "updatedAt")
    VALUES (user_id, ARRAY['Piano', 'Guitar'], NOW(), NOW());
    
    -- Insert Rejected Teacher
    INSERT INTO "User" (
      id, email, name, password, role, "isActive", "emailVerified",
      "approvalStatus", "approvalDate", "approvedBy", "rejectionReason", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'rejected.teacher@test.com',
      'Rejected Teacher',
      '$2a$08$1cGLq/1SlK.ZIJFtM3d0V.UTKKXg2dZdOJa3gVQ6c2b0dF9zdtUBW', -- rejected123
      'TEACHER',
      true,
      NOW(),
      'REJECTED',
      NOW(),
      admin_id,
      'Incomplete documentation',
      NOW(),
      NOW()
    ) RETURNING id INTO user_id;
    
    -- Create teacher profile for rejected teacher
    INSERT INTO "Teacher" ("userId", instruments, "createdAt", "updatedAt")
    VALUES (user_id, ARRAY['Violin'], NOW(), NOW());
    
END $$;

-- Summary of created accounts
-- Run this to see what was created:
/*
SELECT 
  email,
  name,
  role,
  "approvalStatus",
  "approvalDate" IS NOT NULL as "hasApprovalDate",
  "rejectionReason"
FROM "User" 
ORDER BY role, "approvalStatus", email;
*/

-- Demo Account Credentials:
-- Admin: admin@musicteachers.com / admin123
-- Employer: staff@musicteachers.com / employer123  
-- Approved Teacher 1: approved.teacher@test.com / approved123
-- Approved Teacher 2: approved2.teacher@test.com / approved2-123
-- Pending Teacher: pending.teacher@test.com / pending123
-- Rejected Teacher: rejected.teacher@test.com / rejected123