# 🚀 Music Teachers Platform - Deployment Guide

## Phase 1: Quick MVP Deployment (FREE)

This guide walks through deploying the Music Teachers Platform to **Vercel + Supabase** for **$0/month** cost.

---

## 📋 Prerequisites

- [GitHub account](https://github.com)
- [Vercel account](https://vercel.com) (sign up with GitHub)
- [Supabase account](https://supabase.com) (sign up with GitHub)
- [Google Cloud Console](https://console.cloud.google.com) (for OAuth - optional)

---

## 🗄️ Step 1: Setup Supabase Database

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New project"**
3. Choose your organization
4. Fill in project details:
   - **Name:** `music-teachers-platform`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

### 1.2 Get Database URL
1. In your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Copy the **URI** (starts with `postgresql://`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this DATABASE_URL for later

### 1.3 Configure Database (Optional Security)
1. Go to **Authentication** → **Settings**
2. Disable **"Enable email confirmations"** for testing
3. Go to **SQL Editor** and run (optional):
```sql
-- Enable Row Level Security (recommended for production)
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."employers" ENABLE ROW LEVEL SECURITY;
```

---

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push Code to GitHub
```bash
# Make sure you're on develop branch with latest changes
git status
git push origin develop

# Optional: Create main branch for production
git checkout main
git merge develop
git push origin main
```

### 2.2 Connect Vercel to GitHub
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository:
   - Find `music-teachers` repository
   - Click **"Import"**

### 2.3 Configure Deployment Settings
1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `music-teachers/` 
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

### 2.4 Set Environment Variables
In Vercel deployment settings, add these environment variables:

#### Required Variables:
```
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?schema=public

NEXTAUTH_SECRET=your-randomly-generated-secret-here

NEXTAUTH_URL=https://your-app-name.vercel.app
```

#### Optional (Google OAuth):
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2.5 Deploy
1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment
3. Get your deployment URL: `https://your-app-name.vercel.app`

---

## 🔐 Step 3: Configure Google OAuth (Optional)

### 3.1 Create Google OAuth Application
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
   - Application type: **Web application**
   - Name: `Music Teachers Platform`

### 3.2 Configure OAuth URLs
Add these to your OAuth client:

**Authorized JavaScript origins:**
```
https://your-app-name.vercel.app
```

**Authorized redirect URIs:**
```
https://your-app-name.vercel.app/api/auth/callback/google
```

### 3.3 Update Vercel Environment Variables
1. Copy **Client ID** and **Client Secret**
2. Go to Vercel project **Settings** → **Environment Variables**
3. Add/Update:
   - `GOOGLE_CLIENT_ID`: Your client ID
   - `GOOGLE_CLIENT_SECRET`: Your client secret
4. **Redeploy** the application

---

## 🗃️ Step 4: Setup Database Schema

### 4.1 Run Migrations
```bash
# Clone repository locally if needed
git clone https://github.com/your-username/music-teachers.git
cd music-teachers

# Install dependencies
npm install

# Set environment variables locally
cp .env.example .env
# Edit .env with your production DATABASE_URL

# Run migrations
npx prisma migrate deploy

# Seed database with admin user
npx prisma db seed
```

### 4.2 Verify Database Setup
1. Go to Supabase **Table Editor**
2. Verify these tables exist:
   - `users`
   - `teachers`
   - `employers`
   - `jobs`
   - `applications`
   - `accounts` (NextAuth)
   - `sessions` (NextAuth)

---

## ✅ Step 5: Test Deployment

### 5.1 Test Basic Functionality
1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Test pages load:
   - Landing page
   - Sign in page
   - Sign up page

### 5.2 Test Authentication
1. **Admin Login:**
   - Email: `admin@musicteachers.com`
   - Password: `admin123`
2. **Create Test Accounts:**
   - Register as teacher
   - Register as employer (needs admin approval)

### 5.3 Test Full Workflow
1. **Teacher Flow:**
   - Sign up → Browse jobs → Apply for job
2. **Employer Flow:**
   - Sign up → Admin approval → Post job → Review applications
3. **Admin Flow:**
   - Login → Approve users → Manage platform

---

## 🎯 Production Checklist

### Security & Performance:
- [ ] Change default admin password
- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Enable Supabase Row Level Security
- [ ] Configure custom domain (optional)
- [ ] Set up error monitoring (Sentry free tier)
- [ ] Enable Vercel Analytics (free)

### Monitoring:
- [ ] Set up Vercel deployment notifications
- [ ] Monitor Supabase usage limits
- [ ] Test application performance
- [ ] Verify all email flows work

---

## 💰 Cost Breakdown

**Free Tier Limits:**
- **Vercel:** Unlimited personal projects
- **Supabase:** 500MB database, 2GB bandwidth/month
- **Google OAuth:** Free up to high usage limits

**Expected Monthly Cost:** **$0/month** for MVP testing

**When to Upgrade:**
- Database > 500MB → Supabase Pro ($25/month)
- Bandwidth > 2GB → Supabase Pro
- Team collaboration → Vercel Pro ($20/month)

---

## 🆘 Troubleshooting

### Common Issues:

**Build Failures:**
- Check TypeScript errors: `npm run build`
- Verify environment variables are set
- Check Node.js version compatibility

**Database Connection:**
- Verify DATABASE_URL format
- Check Supabase project is running
- Ensure IP whitelisting (if enabled)

**Authentication Issues:**
- Verify NEXTAUTH_URL matches domain
- Check Google OAuth redirect URLs
- Validate NEXTAUTH_SECRET is set

**Deployment Issues:**
- Check Vercel function limits (10s timeout)
- Verify all dependencies in package.json
- Check Vercel build logs for errors

---

## 🎉 Success!

Your Music Teachers Platform should now be live at:
**https://your-app-name.vercel.app**

🎯 **Ready for customer testing!**