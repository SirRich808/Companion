# Google OAuth Setup Guide

Follow these steps to enable Google authentication for your Project Companion app.

## Step 1: Configure Google OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/<your-project-ref>
   - Navigate to: **Authentication** → **Providers**

2. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle it to **Enabled**

3. **Get your Google Cloud credentials** (if you don't have them yet):
   - Go to: https://console.cloud.google.com/
   - Create a new project or select existing one
   - Enable the Google+ API
   - Go to: **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Select **Web application**
   
4. **Configure OAuth consent screen**:
   - Add your app name: "Project Companion"
   - Add support email
   - Add authorized domains: `supabase.co`

5. **Configure Authorized redirect URIs**:
   - Add: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   
6. **Copy credentials to Supabase**:
   - Copy the **Client ID** from Google Cloud Console
   - Copy the **Client Secret** from Google Cloud Console
   - Paste both into the Supabase Google provider settings
   - Click **Save**

## Step 2: Add Localhost for Development

1. In Google Cloud Console OAuth credentials:
   - Add to **Authorized JavaScript origins**: `http://localhost:3000`
   - Add to **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`

## Step 3: Test Authentication

1. Make sure both servers are running:
   ```bash
   # Terminal 1
   npm run server
   
   # Terminal 2
   npm run dev
   ```

2. Open your browser to: http://localhost:3000

3. You should see a beautiful login page with "Continue with Google" button

4. Click the button and sign in with your Google account

5. After successful authentication, you'll be redirected back to the app

## Features Enabled

✅ **User Authentication**
- Google OAuth sign-in
- Secure JWT tokens
- Session management

✅ **User-specific Data**
- Each user can only see their own projects
- Projects are automatically linked to the authenticated user
- Row Level Security (RLS) policies protect data

✅ **Beautiful UI**
- Modern login page with gradient background
- User profile dropdown in the dashboard
- Avatar display with user info

## Security Notes

- All API requests now include authentication tokens
- Database enforces Row Level Security (RLS)
- Users cannot access other users' projects
- Sessions are managed securely by Supabase

## Troubleshooting

**Login button doesn't work?**
- Check browser console for errors
- Verify Google OAuth is enabled in Supabase
- Ensure redirect URI is correct

**Can't see projects after login?**
- Old projects without user_id won't be visible
- Create a new project to test
- Check that JWT tokens are being sent with API requests

**"Authentication required" errors?**
- Make sure you're logged in
- Try logging out and back in
- Check that session is active
