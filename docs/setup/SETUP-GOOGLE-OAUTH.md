# Google OAuth Setup Guide

To enable Google OAuth for teacher authentication, you'll need to create a Google Cloud Console project and configure OAuth credentials.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Give your project a name (e.g., "Music Teachers Platform")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Music Teachers Platform
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add authorized domains if you have a custom domain
5. Save and continue through the steps

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as application type
4. Configure the following:
   - **Name**: Music Teachers Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for local development)
     - `http://localhost:3002` (for Docker)
     - Your production domain (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3002/api/auth/callback/google`
     - Your production callback URL (e.g., `https://yourdomain.com/api/auth/callback/google`)

5. Click "Create"

## Step 5: Get Your Credentials

1. Copy the **Client ID** and **Client Secret**
2. Add them to your environment variables:

### For Local Development (.env.local):
```bash
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
```

### For Docker (.env file):
```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### For Production:
Set these as environment variables in your hosting platform.

## Step 6: Test the Integration

1. Start your application
2. Go to the sign-in page
3. Click "Sign in with Google"
4. Authorize the application
5. You should be redirected back and logged in as a teacher

## Security Notes

- **Never commit credentials** to version control
- Use different OAuth clients for development and production
- Regularly rotate your client secrets
- Monitor usage in Google Cloud Console
- Review and limit OAuth scopes to minimum required

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**: 
   - Check that your callback URL exactly matches what's configured in Google Console
   - Include the correct port number

2. **"This app isn't verified" warning**:
   - This is normal during development
   - For production, you'll need to verify your app with Google

3. **"invalid_client" error**:
   - Double-check your Client ID and Client Secret
   - Ensure environment variables are properly loaded

4. **CORS errors**:
   - Verify your JavaScript origins are correctly configured
   - Check that you're using the right protocol (http/https)

## Production Deployment

For production deployment:

1. Update OAuth settings with your production domain
2. Set up proper HTTPS
3. Consider app verification for better user experience
4. Use environment variables or secret management for credentials
5. Monitor OAuth usage and quotas

## Support

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)