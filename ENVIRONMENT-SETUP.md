# Environment Configuration Guide

## Overview
This project uses separate environment configurations for local development and production deployment.

## Environment Files

### `.env` - Local Development
Used for local development with Docker or local PostgreSQL.
```bash
# Local Development Database (Docker or local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/musicteachers?schema=public"

# Local NextAuth Configuration
NEXTAUTH_SECRET="local-development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3002"

# Google OAuth (optional for local testing)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### `.env.local` - Alternative Local Development
Next.js prioritizes `.env.local` over `.env` for local development overrides.
```bash
# Override any .env settings here for personal local development
DATABASE_URL="postgresql://your-personal-db-connection"
```

### `.env.production` - Production Template
Template for production environment variables (not used directly by Next.js).
```bash
# Production Database (Supabase)
DATABASE_URL="postgresql://postgres.project:password@aws-region.pooler.supabase.com:6543/postgres"

# Production NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-randomly-generated-32-character-secret"

# Production Google OAuth
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
```

## Environment Priority (Next.js)
1. `.env.local` (highest priority, never committed)
2. `.env.production` (when NODE_ENV=production)
3. `.env.development` (when NODE_ENV=development)
4. `.env` (default, lowest priority)

## Current Production Configuration

### Vercel Environment Variables
```
DATABASE_URL=postgresql://postgres.mosjvmjbugsypqpafria:MusicTeach3245@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
NEXTAUTH_URL=https://music-teachers.vercel.app
NEXTAUTH_SECRET=[32-character-secret]
```

### Supabase Database
- **Project**: mosjvmjbugsypqpafria
- **Region**: ap-southeast-1
- **Connection**: Pooler (port 6543)
- **Password**: MusicTeach3245

## Local Development Setup

### Option 1: Docker (Recommended)
```bash
# Start local environment
docker compose up -d

# Initialize database
docker exec music-teachers-app npx prisma db push
docker exec music-teachers-app npm run db:seed

# Access app
open http://localhost:3002
```

### Option 2: Local PostgreSQL
```bash
# Install dependencies
npm install

# Set up local PostgreSQL database
createdb musicteachers

# Update .env.local with your local database URL
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/musicteachers"' > .env.local

# Push schema and seed data
npm run db:push
npm run db:seed

# Start development server
npm run dev

# Access app  
open http://localhost:3000
```

## Database Management

### Local Development
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Production (Supabase)
- Use Supabase dashboard for database management
- SQL Editor for direct queries
- Table Editor for data viewing/editing
- Settings → Database for connection details

## Security Notes

### What's Safe to Commit
- ✅ `.env` (local development defaults)
- ✅ `.env.example` (templates without real values)
- ✅ `.env.production` (templates only)

### Never Commit
- ❌ `.env.local` (personal overrides)
- ❌ Real production secrets
- ❌ Real API keys or passwords

### Production Secrets
- Set environment variables in Vercel dashboard
- Use strong, unique passwords
- Rotate secrets regularly
- Never log or expose secrets in code

## Troubleshooting

### Common Issues
1. **"Database not found"**: Check DATABASE_URL format
2. **"Connection refused"**: Ensure database server is running
3. **"Invalid port number"**: Check for special characters in password
4. **Environment not loading**: Check file naming and NODE_ENV

### Debug Environment Variables
Use the debug endpoint (temporarily):
```
GET /api/debug?key=debug123
```

### Reset Local Database
```bash
# Docker
docker compose down -v
docker compose up -d

# Local PostgreSQL
dropdb musicteachers
createdb musicteachers
npm run db:push
npm run db:seed
```

## Migration Between Environments

### From Local to Production
1. Export local data (if needed)
2. Push schema to production: `DATABASE_URL="prod-url" npx prisma db push`
3. Seed production database
4. Update Vercel environment variables
5. Deploy application

### From Production to Local
1. Get production schema: Connect to Supabase and export
2. Update local schema
3. Reset local database with new schema
4. Import sample data for development