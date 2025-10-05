# 🚀 Deployment Guide

## Important: Two Separate Deployments Needed

Your app has **frontend (React)** and **backend (Express API)** that must be deployed separately.

---

## 🎨 Frontend Deployment (Netlify)

### 1. Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

### 2. Environment Variables (Netlify Dashboard)

Add these in: Netlify Dashboard → Site Settings → Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

⚠️ **NEVER add `GEMINI_API_KEY` to frontend env vars** - it would be exposed to users!

### 3. Deploy
```bash
# Connect your GitHub repo to Netlify or use CLI:
npm install -g netlify-cli
netlify deploy --prod
```

---

## ⚙️ Backend Deployment (Railway/Render/Fly.io)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. **Configure Start Command:** `node server/index.js`
5. **Add Environment Variables:**

```bash
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_DB_URL=postgresql://postgres:password@host.supabase.com:6543/postgres
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
PORT=4000
```

6. Deploy! Railway will give you a URL like: `https://your-app.railway.app`
7. Copy that URL and update `VITE_API_BASE_URL` in Netlify

### Option B: Render

1. Go to [render.com](https://render.com)
2. New → Web Service → Connect GitHub repo
3. **Build Command:** `npm install`
4. **Start Command:** `node server/index.js`
5. Add same environment variables as above
6. Deploy and copy the URL

### Option C: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Navigate to your project
cd project-companion-4

# Create fly.toml
fly launch --no-deploy

# Set secrets
fly secrets set GEMINI_API_KEY=your_key_here
fly secrets set SUPABASE_DB_URL=your_db_url_here

# Deploy
fly deploy
```

---

## 🔐 Security Best Practices

### ✅ DO:
- Store `GEMINI_API_KEY` **only on backend** (Railway/Render)
- Use `VITE_SUPABASE_ANON_KEY` on frontend (safe - has RLS protection)
- Keep `.env.local` in `.gitignore`
- Use environment variables in deployment platforms

### ❌ DON'T:
- Put `GEMINI_API_KEY` in Netlify environment variables
- Commit `.env.local` to git
- Hard-code API keys in code
- Use backend DB URL in frontend

---

## 📋 Deployment Checklist

- [ ] Backend deployed to Railway/Render/Fly
- [ ] Backend environment variables set
- [ ] Backend URL obtained
- [ ] Frontend `VITE_API_BASE_URL` updated with backend URL
- [ ] Frontend deployed to Netlify
- [ ] Frontend environment variables set
- [ ] Database migration run: `npm run db:migrate`
- [ ] Test login with magic link
- [ ] Test creating a project
- [ ] Verify API calls reach backend

---

## 🐛 Troubleshooting

### "Failed to fetch" errors
- Check `VITE_API_BASE_URL` points to your backend
- Verify backend is running
- Check CORS settings in `server/index.js`

### "Authentication error"
- Verify Supabase environment variables are correct
- Check Supabase Auth is enabled
- Confirm RLS policies are active

### Backend won't start
- Check all environment variables are set
- Verify Node version is 18+
- Check database connection string

---

## 🔄 Updates After Deployment

Whenever you update code:

1. **Backend changes:**
   ```bash
   git push origin main
   # Railway/Render auto-deploys from GitHub
   ```

2. **Frontend changes:**
   ```bash
   git push origin main
   # Netlify auto-deploys from GitHub
   ```

Both platforms support auto-deployment from GitHub!

---

## 📊 Example Architecture

```
User Browser
    ↓
Netlify (Frontend) → Railway (Backend API) → Supabase (Database + Auth)
    ↓                      ↓
React App           Express + Gemini AI
+ Supabase Auth
```

Your frontend never touches the Gemini API directly - all AI requests go through your backend!
