# Demo Users Setup for Music Teachers Platform

## SQL Script to Create Demo Users

```sql
-- Insert Admin User
INSERT INTO "users" (
  id, email, name, password, role, "isActive", "emailVerified", 
  "approvalStatus", "approvalDate", "createdAt", "updatedAt"
) VALUES (
  'admin-uuid-001',
  'admin@musicteachers.com',
  'Admin User',
  '$2b$08$KO6SJfx7FEGIVm1CYuEJsekNpyYOEXsvG87KquMm2Mdd94Qg3ORTa',
  'ADMIN',
  true,
  NOW(),
  'APPROVED',
  NOW(),
  NOW(),
  NOW()
);

-- Insert Staff Employer
INSERT INTO "users" (
  id, email, name, password, role, "isActive", "emailVerified",
  "approvalStatus", "approvalDate", "createdAt", "updatedAt"
) VALUES (
  'emp-uuid-001',
  'staff@musicteachers.com',
  'Staff Employer', 
  '$2b$08$MWXuXzLTIgfpGdfjG8ZTxelCKgAUoT1vlF4JIcKWCcZ3cF/s3ujgu',
  'EMPLOYER',
  true,
  NOW(),
  'APPROVED',
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "employers" (id, "userId", organization, phone, "createdAt", "updatedAt")
VALUES ('employer-profile-001', 'emp-uuid-001', 'Music Academy Demo', '+1234567890', NOW(), NOW());

-- Insert Approved Teacher 1
INSERT INTO "users" (
  id, email, name, password, role, "isActive", "emailVerified",
  "approvalStatus", "approvalDate", "createdAt", "updatedAt"
) VALUES (
  'teacher-uuid-001',
  'approved.teacher@test.com',
  'Approved Teacher',
  '$2b$08$POFqe8/qVsgM9OySxGW0levMurt5d81iFRGIPkJpL3VOW9uJaFK8m',
  'TEACHER',
  true,
  NOW(),
  'APPROVED',
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "teachers" (id, "userId", instruments, qualifications, "createdAt", "updatedAt")
VALUES ('teacher-profile-001', 'teacher-uuid-001', ARRAY['Piano', 'Saxophone'], 'Master of Music Performance', NOW(), NOW());

-- Insert Approved Teacher 2
INSERT INTO "users" (
  id, email, name, password, role, "isActive", "emailVerified",
  "approvalStatus", "approvalDate", "createdAt", "updatedAt"
) VALUES (
  'teacher-uuid-002',
  'approved2.teacher@test.com',
  'Second Approved Teacher',
  '$2b$08$Lg6xuUvm9/9SjKFA3OHMdu73Jdzu2INUO2oZQ2okW7YKjfZNVLsjW',
  'TEACHER',
  true,
  NOW(),
  'APPROVED',
  NOW(),
  NOW(),
  NOW()
);

INSERT INTO "teachers" (id, "userId", instruments, qualifications, "createdAt", "updatedAt")
VALUES ('teacher-profile-002', 'teacher-uuid-002', ARRAY['Guitar', 'Voice'], 'Bachelor of Music Education', NOW(), NOW());

-- Insert Pending Teacher
INSERT INTO "users" (
  id, email, name, password, role, "isActive", "emailVerified",
  "approvalStatus", "createdAt", "updatedAt"
) VALUES (
  'teacher-uuid-003',
  'pending.teacher@test.com',
  'Pending Teacher',
  '$2b$08$AXlBlZQED4998eUTC2AG6e7h5yv53BNKFYdb6Hk8fEDaH1M6EI2BO',
  'TEACHER',
  true,
  NOW(),
  'PENDING',
  NOW(),
  NOW()
);

INSERT INTO "teachers" (id, "userId", instruments, "createdAt", "updatedAt")
VALUES ('teacher-profile-003', 'teacher-uuid-003', ARRAY['Piano', 'Guitar'], NOW(), NOW());

-- Insert Rejected Teacher
INSERT INTO "users" (
  id, email, name, password, role, "isActive", "emailVerified",
  "approvalStatus", "approvalDate", "rejectionReason", "createdAt", "updatedAt"
) VALUES (
  'teacher-uuid-004',
  'rejected.teacher@test.com',
  'Rejected Teacher',
  '$2b$08$J8odzKpFjizjC4HR75hCH.gLMI7e/ao01ylfQVFyuyH/qKOwLCK/u',
  'TEACHER',
  true,
  NOW(),
  'REJECTED',
  NOW(),
  'Incomplete documentation',
  NOW(),
  NOW()
);

INSERT INTO "teachers" (id, "userId", instruments, "createdAt", "updatedAt")
VALUES ('teacher-profile-004', 'teacher-uuid-004', ARRAY['Violin'], NOW(), NOW());
```

## Demo Account Login Credentials

### Admin Account
- **Email**: `admin@musicteachers.com`
- **Password**: `admin123`
- **Role**: Administrator
- **Status**: Approved
- **Access**: Full admin panel access at `/admin`

### Employer Account
- **Email**: `staff@musicteachers.com`
- **Password**: `employer123`
- **Role**: Employer
- **Status**: Approved
- **Organization**: Music Academy Demo
- **Access**: Can post jobs and manage applications

### Teacher Accounts

#### Approved Teacher 1
- **Email**: `approved.teacher@test.com`
- **Password**: `approved123`
- **Role**: Teacher
- **Status**: Approved
- **Instruments**: Piano, Saxophone
- **Qualifications**: Master of Music Performance

#### Approved Teacher 2
- **Email**: `approved2.teacher@test.com`
- **Password**: `approved2-123`
- **Role**: Teacher
- **Status**: Approved
- **Instruments**: Guitar, Voice
- **Qualifications**: Bachelor of Music Education

#### Pending Teacher (For Testing Approval Workflow)
- **Email**: `pending.teacher@test.com`
- **Password**: `pending123`
- **Role**: Teacher
- **Status**: Pending Approval
- **Instruments**: Piano, Guitar
- **Note**: Cannot login until approved by admin

#### Rejected Teacher (For Testing Approval Workflow)
- **Email**: `rejected.teacher@test.com`
- **Password**: `rejected123`
- **Role**: Teacher
- **Status**: Rejected
- **Instruments**: Violin
- **Rejection Reason**: Incomplete documentation
- **Note**: Cannot login due to rejected status

## Usage Instructions

1. **Run the SQL script** in your PostgreSQL database to create all demo users
2. **Use the login credentials** above to test different user roles
3. **Test the approval workflow** using the pending and rejected teacher accounts
4. **Admin can manage approvals** at `/admin` after logging in as admin
5. **Employers can post jobs** and manage applications
6. **Approved teachers can apply** for jobs and manage their profiles

## Testing the Approval System

1. Login as admin (`admin@musicteachers.com` / `admin123`)
2. Go to `/admin` to see the approval dashboard
3. You should see the pending teacher waiting for approval
4. Test approving/rejecting users
5. Try logging in as pending/rejected teachers to see the error messages