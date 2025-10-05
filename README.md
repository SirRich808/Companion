<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1uZF3-a-I9iClIHEq8rpIJUosQK58fzvL

## Run Locally

**Prerequisites:**  Node.js 18+

1. Install dependencies:
   `npm install`
2. Configure environment variables in [.env.local](.env.local):
   - `GEMINI_API_KEY` – Gemini access token (required)
   - `SUPABASE_DB_URL` – Supabase Postgres connection string (required for persistence)
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` – optional front-end access if you plan to call Supabase REST directly
   - `VITE_API_BASE_URL` – API origin for the local Express server (defaults to `http://localhost:4000`)
3. Provision the database schema (run once per project):
   `npm run db:setup`
   > If you see a network connectivity error when running the setup script, confirm you can reach `db.cldiiacmajhbdlwgbfzn.supabase.co` from your environment and rerun the command.
4. Start the Supabase-backed API server:
   `npm run server`
5. In a separate terminal, run the Vite app:
   `npm run dev`

The Vite dev server proxies `/api` requests to the Express server, so the React app can read and write Supabase-backed project data without additional configuration.
