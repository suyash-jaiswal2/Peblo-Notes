# Peblo Notes — AI Workspace

Full-stack collaborative notes app with AI-powered summaries, action item extraction, search, public sharing, and productivity insights.

## Stack
Next.js 14 · TypeScript · Prisma · PostgreSQL (Neon) · Groq AI · Framer Motion · TipTap · Zustand

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. `npx prisma db push`
5. `npm run dev`

## Environment Variables
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — Any random 32-char string
- `GROQ_API_KEY` — From console.groq.com (free)
- `NEXT_PUBLIC_APP_URL` — http://localhost:3000