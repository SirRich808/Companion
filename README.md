# 🚀 Project Companion

An intelligent AI-powered project management platform with **Google OAuth authentication**, **real-time task tracking**, and **comprehensive analytics**. Built with React, TypeScript, Supabase, and Google Gemini AI.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20PostgreSQL-green)

## ✨ Features

### 🔐 **Authentication & Security**
- **Google OAuth** & **Magic Link** authentication via Supabase
- Beautiful glassmorphism login page
- User profile management with avatars
- **Row Level Security (RLS)** for data isolation
- JWT token-based API authentication

### 🤖 **AI-Powered Intelligence**
- Google Gemini AI integration for project insights
- Automated task extraction and categorization
- Risk detection and alerts
- Project brief generation
- Smart tagging system
- AI loading overlay with 15 rotating motivational phrases

### 📊 **Project Management**
- Interactive task boards (In Progress, Next Actions, Blockers, Completed)
- Real-time project analytics and health scores
- Task preview on dashboard cards
- 7-day activity trends
- Tag cloud visualization
- Progress tracking and metrics

### 💼 **Collaboration & Export**
- Share projects with unique links
- Export tasks to Markdown, JSON, CSV, or Todoist format
- Project timeline view
- Living document state management
- Portfolio brief overview

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **Supabase Account** (free tier works!)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone git@github.com:SirRich808/Companion.git
cd Companion
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini AI (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Database (Required)
SUPABASE_DB_URL=postgresql://postgres.xxx:password@aws-x-xxx.pooler.supabase.com:6543/postgres

# Supabase Frontend (Required for Auth)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=http://localhost:4000
```

### 4. Setup Database

Run the database setup script to create tables and enable Row Level Security:

```bash
npm run db:setup
npm run db:migrate
```

### 5. Configure Google OAuth (Optional but Recommended)

Follow the detailed guide in [`GOOGLE_AUTH_SETUP.md`](./GOOGLE_AUTH_SETUP.md) to enable Google sign-in.

**Quick Steps:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers
2. Enable **Google** provider
3. Add your Google OAuth credentials
4. Enable **Email** provider for magic links (works immediately!)

### 6. Run the Application

Start both servers in separate terminals:

**Terminal 1 - Backend API:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

🎉 **Open http://localhost:3000** in your browser!

## 📁 Project Structure

```
project-companion/
├── components/          # React components
│   ├── AILoadingOverlay.tsx
│   ├── LoginPage.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectOverview.tsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── useProjects.ts
├── server/             # Express.js backend
│   ├── db.js
│   ├── index.js
│   ├── projectRepository.js
│   └── migrations/
├── services/           # API clients
│   ├── apiClient.ts
│   ├── geminiService.ts
│   └── supabaseClient.ts
└── types.ts            # TypeScript definitions
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server (port 3000) |
| `npm run server` | Start Express API server (port 4000) |
| `npm run build` | Build for production |
| `npm run db:setup` | Create database tables |
| `npm run db:migrate` | Run authentication migration |
| `npm run db:test` | Test database connection |

## 🎨 Tech Stack

### Frontend
- **React 19.2** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Supabase JS** - Authentication client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** (Supabase) - Database
- **pg** - PostgreSQL client

### AI & Services
- **Google Gemini AI** - Natural language processing
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage

## 🔒 Security Features

- **Row Level Security (RLS)** policies on all tables
- **JWT token verification** on API endpoints
- **User data isolation** - users can only access their own projects
- **Secure password-less authentication** via magic links
- **SSL/TLS** for all database connections

## 📝 Usage Guide

### Creating Your First Project

1. **Sign in** with Google or Magic Link
2. Click **"New Project"**
3. Enter project name and goal
4. (Optional) Add initial context/document
5. Watch the **AI process** your project!

### Managing Tasks

- View tasks on the **Overview tab**
- Tasks are automatically categorized:
  - 🔵 **In Progress** - Active work
  - 🟣 **Next Actions** - Upcoming tasks
  - 🔴 **Blockers** - Issues to resolve
  - ✅ **Completed** - Done tasks

### Adding Updates

Use the input at the bottom to add updates like:
- "Completed user authentication, working on dashboard"
- "Blocked by API rate limits, need to optimize"
- "Started design mockups, planning sprint"

The AI will automatically extract tasks, detect risks, and update your project state!

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Deploy Backend

Use any Node.js hosting:
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Fly.io](https://fly.io)

Update `VITE_API_BASE_URL` to your deployed backend URL.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language processing
- **Supabase** for authentication and database
- **Vercel** for hosting
- **TailwindCSS** for beautiful UI

---

Built with ❤️ by [SirRich808](https://github.com/SirRich808)
