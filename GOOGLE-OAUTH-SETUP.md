# Google OAuth Setup for Multiple Environments

## Overview
This project uses separate Google OAuth applications for local development and production environments to avoid configuration conflicts.

## Environment Strategy

### Local Development
- **URL**: `http://localhost:3002`
- **Environment File**: `.env.local` (highest priority)
- **Google OAuth App**: Separate app configured for localhost

### Production
- **URL**: `https://music-teachers.vercel.app`
- **Environment Config**: Vercel dashboard
- **Google OAuth App**: Separate app configured for production domain

## Setup Instructions

### Step 1: Create Local Development OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Credentials** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**

**Configuration:**
- **Application type**: Web application
- **Name**: `Music Teachers - Local Development`
- **Authorized JavaScript origins**:
  ```
  http://localhost:3002
  ```
- **Authorized redirect URIs**:
  ```
  http://localhost:3002/api/auth/callback/google
  ```

5. **Save** and copy the Client ID and Client Secret

### Step 2: Create Production OAuth App

1. In the same Google Cloud Console project
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**

**Configuration:**
- **Application type**: Web application
- **Name**: `Music Teachers - Production`
- **Authorized JavaScript origins**:
  ```
  https://music-teachers.vercel.app
  ```
- **Authorized redirect URIs**:
  ```
  https://music-teachers.vercel.app/api/auth/callback/google
  ```

3. **Save** and copy the Client ID and Client Secret

### Step 3: Configure Local Development

1. **Open** `.env.local` in your project root
2. **Uncomment and update** the Google OAuth variables:
   ```bash
   # Google OAuth for Local Development
   GOOGLE_CLIENT_ID="your-local-dev-client-id-here"
   GOOGLE_CLIENT_SECRET="your-local-dev-client-secret-here"
   ```

3. **Restart** your development server:
   ```bash
   npm run dev
   ```

### Step 4: Configure Production

1. **Go to** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select** your Music Teachers project
3. **Navigate to** Settings → Environment Variables
4. **Update** the existing Google OAuth variables:
   ```
   GOOGLE_CLIENT_ID = your-production-client-id-here
   GOOGLE_CLIENT_SECRET = your-production-client-secret-here
   ```

5. **Redeploy** the application

## Testing

### Local Development Testing
1. Start local server: `npm run dev`
2. Navigate to: `http://localhost:3002/auth/signin`
3. Click "Sign in with Google"
4. Should redirect to Google OAuth and back to localhost:3002

### Production Testing
1. Navigate to: `https://music-teachers.vercel.app/auth/signin`
2. Click "Sign in with Google"
3. Should redirect to Google OAuth and back to production domain

## Troubleshooting

### Common Issues

**1. "Error 400: redirect_uri_mismatch"**
- Check that the redirect URI in Google Console exactly matches your environment
- Local: `http://localhost:3002/api/auth/callback/google`
- Production: `https://music-teachers.vercel.app/api/auth/callback/google`

**2. "Client ID not found"**
- Ensure you're using the correct Client ID for each environment
- Local environment should use local app credentials
- Production should use production app credentials

**3. Google OAuth not working locally**
- Verify `.env.local` has the correct local development credentials
- Restart the development server after changing environment variables
- Check that `NEXTAUTH_URL` is set to `http://localhost:3002`

**4. Google OAuth not working in production**
- Verify Vercel environment variables are set correctly
- Ensure production OAuth app is configured for the correct domain
- Check Vercel deployment logs for any errors

## Environment Files Summary

### `.env` (Base/Default)
```bash
# Google OAuth Configuration 
# Set environment-specific values in .env.local (dev) or Vercel dashboard (prod)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

### `.env.local` (Local Development Override)
```bash
# Google OAuth for Local Development
GOOGLE_CLIENT_ID="your-local-dev-google-client-id"
GOOGLE_CLIENT_SECRET="your-local-dev-google-client-secret"
```

### Vercel Environment Variables (Production)
```
GOOGLE_CLIENT_ID = your-production-google-client-id
GOOGLE_CLIENT_SECRET = your-production-google-client-secret
```

## Security Notes

- **Never commit** real Google OAuth credentials to the repository
- **Use separate** OAuth applications for each environment
- **Rotate credentials** periodically for security
- **Monitor** OAuth usage in Google Cloud Console

## Next Steps

After setting up Google OAuth:
1. Test Google sign-in in both environments
2. Verify user creation flow works with Google accounts
3. Test role assignment for Google OAuth users
4. Consider adding additional OAuth providers if needed