# Music Teachers Platform MVP

A platform connecting music teachers with job opportunities, built with Next.js 15, TypeScript, and PostgreSQL.

## Quick Start

### Option 1: Docker (Recommended)

1. **Start with Docker:**
   ```bash
   docker compose up -d
   ```

2. **Initialize the database and create admin user:**
   ```bash
   docker exec music-teachers-app npx prisma db push
   docker exec music-teachers-app npm run db:seed
   ```

3. **Visit the app:**
   Open [http://localhost:3002](http://localhost:3002)

4. **Default admin login:**
   - Email: `admin@musicteachers.com`
   - Password: `admin123`
   - **⚠️ Change this password immediately after first login!**

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your database:**
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in `.env.local` with your database connection string
   - Generate Prisma client and push schema:
     ```bash
     npm run db:generate
     npm run db:push
     ```

3. **Configure environment variables:**
   - Update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/musicteachers"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Visit the app:**
   Open [http://localhost:3000](http://localhost:3000)

## MVP Features

### ✅ Implemented
- **Google OAuth for Teachers**: Sign in with Google account
- **Admin-controlled Employers**: Only admins can create employer accounts
- **Role-based access control**: TEACHER, EMPLOYER, ADMIN roles
- **Job listings display**: Browse and search teaching opportunities
- **Job application system**: Teachers can apply to jobs
- **Admin panel**: User management and employer creation
- **Responsive UI**: Tailwind CSS with mobile-friendly design

### 🚧 Next Phase
- Job posting form for employers
- Teacher profile management
- Application management dashboard
- WWC verification system
- Email notifications
- Rating system

## Database Schema

The app uses Prisma with PostgreSQL and includes:
- **Users** (with Teacher/Employer roles)
- **Teachers** (profiles with WWC info, instruments, etc.)
- **Employers** (organization profiles)  
- **Jobs** (postings with requirements)
- **Applications** (teacher applications to jobs)
- **Ratings** (feedback system)

## Development Commands

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio
```

### Docker Commands
```bash
# Production deployment
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose logs               # View logs
docker compose ps                 # View running containers

# Development with hot reload
docker compose -f docker-compose.dev.yml up -d

# Database management
docker exec music-teachers-app npx prisma db push     # Initialize/update schema
docker exec music-teachers-app npx prisma studio      # Open Prisma Studio
docker exec -it music-teachers-db psql -U postgres -d musicteachers  # Connect to DB

# Maintenance
docker compose down -v            # Stop and remove volumes
docker system prune -f            # Clean up Docker resources
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js
- **Deployment:** Vercel (recommended)

## Next Steps for Production

1. Set up production PostgreSQL (AWS RDS recommended)
2. Configure proper email service (SendGrid/AWS SES)
3. Implement file upload for WWC documents (AWS S3)
4. Add comprehensive error handling and logging
5. Set up monitoring and analytics
6. Implement proper testing suite

## Deployment Status

- ✅ Configured for Vercel deployment with Prisma support
- 🔧 Ready for Supabase PostgreSQL integration
