# 🚀 Supabase Edge Functions Migration

## Why Edge Functions?
- ✅ Everything in one place (database + auth + functions)
- ✅ Secrets managed by Supabase  
- ✅ Auto-scaling, no server management
- ✅ Free tier includes 500K function invocations/month

---

## 🔧 Setup Steps

### 1. Deploy Edge Functions

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref <your-project-ref>

# Set your Gemini API key as a secret
npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# Deploy all functions
npx supabase functions deploy process-update
npx supabase functions deploy generate-tags
npx supabase functions deploy generate-brief
npx supabase functions deploy portfolio-brief
```

### 2. Update Frontend API Client

Change the base URL in `services/apiClient.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';
```

### 3. Update Environment Variables

**Netlify (Frontend):**
```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Supabase Secrets (Backend):**
```bash
npx supabase secrets set GEMINI_API_KEY=your_key
```

---

## 📋 What Changed

| Before (Express) | After (Edge Functions) |
|---|---|
| Railway/Render deployment | Supabase Edge Functions |
| Manual secret management | `supabase secrets` CLI |
| 2 deployments (frontend + backend) | 1 deployment (Netlify frontend) |
| `POST /api/ai/process-update` | `POST /functions/v1/process-update` |

---

## ✅ Benefits

1. **Simpler Deployment**: No separate backend server
2. **Better Security**: Secrets stored in Supabase vault
3. **Auto-scaling**: Handles traffic spikes automatically
4. **Cost**: Free tier covers most usage

---

## 🧪 Test Locally

```bash
# Start Supabase local stack
npx supabase start

# Deploy functions locally
npx supabase functions serve

# Test
curl -X POST http://localhost:54321/functions/v1/process-update \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"updateText": "test", "project": {"name": "Test", "goal": "Test"}}'
```

---

## 📁 File Structure

```
supabase/
├── functions/
│   ├── _shared/
│   │   └── cors.ts           # Shared CORS headers
│   ├── process-update/
│   │   └── index.ts          # AI update processing
│   ├── generate-tags/
│   │   └── index.ts          # Tag generation
│   ├── generate-brief/
│   │   └── index.ts          # Project brief
│   └── portfolio-brief/
│       └── index.ts          # Portfolio analysis
```

---

## 🚨 Migration Checklist

- [ ] Deploy Edge Functions to Supabase
- [ ] Set `GEMINI_API_KEY` secret in Supabase
- [ ] Update frontend API base URL
- [ ] Remove Express backend files (optional)
- [ ] Test all AI features
- [ ] Deploy frontend to Netlify

---

## 🔄 Rollback Plan

If something goes wrong, you can quickly rollback:

1. Change `VITE_API_BASE_URL` back to Express backend
2. Restart Express server
3. Frontend will use old backend again

---

Ready to deploy? Run:
```bash
npx supabase functions deploy
```
