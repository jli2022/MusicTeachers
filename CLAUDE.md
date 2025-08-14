# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Music Teacher Jobs & Substitutes Platform** that connects music teachers with employment opportunities. The platform serves two main user types:
- **Teachers**: Create profiles, apply for positions, manage availability
- **Employers**: Post job listings, review applications, hire teachers

## Core Architecture

The platform is built around these key domains:

### User Management & Authentication
- Dual user types (Teachers/Employers) with role-based access
- Secure authentication with email verification
- WWC (Working With Children) compliance verification system

### Job Management System
- Two job types: Fill-In (temporary) and Permanent positions
- Application workflow: Post → Apply → Accept → Confirm
- Automated email notifications and calendar integration

### Profile & Verification System
- Teacher profiles with instruments, qualifications, and experience
- Mandatory WWC verification with automated expiry tracking
- Rating system for post-job feedback

### Search & Filtering
- Multi-criteria search (instrument, location, date, pay rate)
- Notification preferences (email/SMS)
- Calendar and list view options

## Key Features to Implement

### Security & Compliance
- End-to-end encryption for personal data
- WWC database integration for verification
- Automated compliance monitoring and alerts

### Core Workflows
1. **Teacher Registration**: Profile creation → WWC verification → Account activation
2. **Job Posting**: Create listing → Receive applications → Accept candidate → Job confirmation
3. **Application Process**: Search jobs → Apply → Receive acceptance → Complete job details

### Administrative Features
- User management (approve, suspend, block)
- Job post moderation
- Analytics dashboard with engagement metrics
- Automated WWC expiry warnings

## Development Notes

This appears to be a greenfield project with only feature specifications available. The codebase will need to be built from scratch following the requirements in `Spec.Feataures.md`.

### Key Integration Requirements
- WWC database API integration
- Email service for notifications
- SMS service for alerts
- Calendar system integration
- Payment processing system

### Compliance Considerations
- Data protection and privacy regulations
- Working with Children check requirements
- Educational institution compliance standards

## Recommended Technical Stack

### Frontend
- **Next.js 15** with App Router + TypeScript
- **Tailwind CSS** + shadcn/ui for UI components
- Server-side rendering for SEO optimization

### Backend
- **Next.js API Routes** for backend functionality
- **PostgreSQL** (RDS) for database
- **Prisma** ORM for type-safe database operations

### Authentication & Security
- **Auth0** or **Supabase Auth** for user management
- Role-based access control (teachers vs employers)
- **bcrypt** for password hashing

### Infrastructure
- **AWS RDS** for PostgreSQL database
- **Vercel** for deployment and hosting
- **AWS S3** for file storage (WWC documents, profiles)

### Third-party Services
- **SendGrid/AWS SES** for email notifications
- **Twilio** for SMS alerts
- **Google Calendar API** for scheduling
- **Stripe** for payment processing