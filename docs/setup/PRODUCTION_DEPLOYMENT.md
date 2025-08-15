# Production Deployment Guide

## Overview

This guide covers deploying the Music Teachers Platform to production with the approval system properly configured.

## Prerequisites

1. **Production Database**: PostgreSQL database ready for use
2. **Vercel Account**: Configured for deployment
3. **Environment Variables**: Production environment variables set

## Deployment Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel project settings and configure these environment variables:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=your-secure-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
ADMIN_NAME=System Administrator

# Production Settings
NODE_ENV=production
ENABLE_DEMO_USERS=false
ENABLE_DATABASE_INIT=true  # Set to true for initial deployment only
```

### 2. Deploy to Production

Push to the main branch to trigger deployment:

```bash
git checkout main
git merge feature/production-ready-approval-system
git push origin main
```

### 3. Deploy to Production

The deployment process:
- Builds the application (no database operations during build)
- Application becomes available immediately
- Database setup happens separately (see step 4)

### 4. Database Setup (Manual - One Time)

After successful deployment, run the database setup:

**Option A: Use the API endpoint (if enabled)**
```bash
curl -X POST https://your-app.vercel.app/api/admin/init-db \
  -H "Content-Type: application/json" \
  -d '{"createDemoUsers": false}'
```

**Option B: Run post-deploy script locally**
```bash
npm run post-deploy
```

**Option C: Manual migration (most reliable)**
```bash
npx prisma migrate deploy
npm run db:seed
```

### 5. Verify Deployment

1. **Check Admin User**: Try logging in with your admin credentials
2. **Test Approval System**: Go to `/admin` to verify the approval dashboard works
3. **Check Features**: Ensure demo users are disabled in production

### 6. Post-Deployment Security

After successful deployment:

1. **Disable Database Init**: Set `ENABLE_DATABASE_INIT=false` in Vercel
2. **Change Admin Password**: Log in and change the admin password
3. **Monitor Logs**: Check Vercel function logs for any issues

## Environment Configuration

### Production (Secure)
```env
NODE_ENV=production
ENABLE_DEMO_USERS=false           # No test users
ENABLE_DATABASE_INIT=false        # Disable after initial setup
ENABLE_MIGRATION_ENDPOINTS=false  # No migration endpoints
```

### Development (Full Features)
```env
NODE_ENV=development
ENABLE_DEMO_USERS=true           # Create test users
ENABLE_DATABASE_INIT=true        # Allow database initialization
ENABLE_MIGRATION_ENDPOINTS=true  # Enable migration endpoints
```

## Database Schema

The approval system adds these fields to the users table:
- `approvalStatus`: ENUM ('PENDING', 'APPROVED', 'REJECTED')
- `approvalDate`: TIMESTAMP (when approved/rejected)
- `rejectionReason`: TEXT (reason for rejection)

## Features

### Admin Approval System
- **Admin Dashboard**: `/admin` - Manage user approvals
- **User Roles**: ADMIN, TEACHER, EMPLOYER
- **Approval States**: PENDING, APPROVED, REJECTED
- **Authentication**: Users blocked until approved

### Production Safety
- No demo users in production
- Environment-specific configurations
- Proper database migrations
- Secure admin user setup

## Troubleshooting

### Migration Issues
If migrations fail:
1. Check DATABASE_URL is correct
2. Verify database permissions
3. Check Vercel function logs

### Admin User Issues
If admin user isn't created:
1. Check environment variables
2. Verify seed script ran during build
3. Run seed manually if needed

### Approval System Issues
1. Verify migration applied correctly
2. Check admin dashboard accessibility
3. Confirm user approval status in database

## Rollback Plan

If deployment fails:
1. Revert to previous Vercel deployment
2. Check database for any schema changes
3. Fix issues and redeploy

## Monitoring

Monitor these after deployment:
- User registration and approval workflow
- Admin dashboard functionality
- Authentication success rates
- Database performance