# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Music Teacher Jobs & Substitutes Platform** that connects music teachers with employment opportunities. The platform serves two main user types:
- **Teachers**: Create profiles, apply for positions, manage availability  
- **Employers**: Post job listings, review applications, hire teachers

## Current Status (August 2025)

✅ **Production Ready** - Deployed at https://music-teachers.vercel.app
✅ **Complete Approval System** - Teachers require admin approval before accessing platform
✅ **Demo Users Available** - See DEMO_USERS_SETUP.md for login credentials
✅ **Admin Dashboard** - Full user management at `/admin`

## Technical Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL via Prisma ORM + Supabase  
- **Authentication**: NextAuth.js with Google OAuth + credentials
- **Authorization**: Role-based (ADMIN/EMPLOYER/TEACHER) + Approval System
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **File Storage**: (To be implemented)

## Documentation Structure

- **Root Level**: `README.md`, `CLAUDE.md` (minimal, essential only)
- **docs/spec/**: Specifications and reference materials
- **docs/setup/**: Environment setup, OAuth configuration, deployment guides
- **docs/implementation/**: Technical implementation details, workflows
- **docs/archive/**: Historical logs and outdated documentation

## Key Features Implemented

### Authentication & Authorization
- ✅ NextAuth.js with credentials and Google OAuth
- ✅ Role-based access (ADMIN, EMPLOYER, TEACHER)
- ✅ Teacher approval workflow (PENDING/APPROVED/REJECTED)
- ✅ Session management and protected routes

### User Management
- ✅ Admin dashboard for user approval/rejection
- ✅ Teacher and employer profile creation
- ✅ Demo users for testing all scenarios
- ✅ Password hashing with bcrypt

### Database Schema
- ✅ User model with approval system fields
- ✅ Teacher profiles with instruments and qualifications
- ✅ Employer profiles with organization details
- ✅ Jobs and applications models (basic structure)
- ✅ Proper foreign key relationships

### UI Components
- ✅ Responsive design with Tailwind CSS
- ✅ Login/signup flows for different user types
- ✅ Admin approval interface with modal dialogs
- ✅ Dashboard layouts for different roles

## Key Features To Implement

### Job Management
- Job posting interface for employers
- Job application system for teachers
- Application review and hiring workflow
- Calendar integration for scheduling

### Advanced Features
- WWC verification system (partially implemented)
- Rating and review system
- Email notifications
- Advanced search and filtering
- Payment integration

## Development Workflow

- **Main Branch**: Production-ready code, auto-deploys to Vercel
- **Develop Branch**: Active development, aligned with main
- **Feature Branches**: No longer used - work directly on develop

## Important Notes for Claude

1. **Approval System**: All new teacher registrations are PENDING by default
2. **Demo Data**: Use `docs/spec/DEMO_USERS_SETUP.md` for testing - contains proper bcrypt hashes
3. **TypeScript**: Use `as any` for approval system fields due to Prisma schema limitations
4. **Environment**: Production uses environment variables for feature flags
5. **Database**: Supabase PostgreSQL with connection pooling in production

## Quick Start for Development

1. Clone repo and checkout develop branch
2. Copy `.env.example` to `.env.local` and configure
3. Run `npm install` and `npx prisma generate`
4. Use demo users from `docs/spec/DEMO_USERS_SETUP.md` for testing
5. Admin access: admin@musicteachers.com / admin123

## References

- Feature specifications: `docs/spec/Spec.Features.md`
- Demo setup: `docs/spec/DEMO_USERS_SETUP.md`
- Implementation details: `docs/implementation/`
- Setup guides: `docs/setup/`