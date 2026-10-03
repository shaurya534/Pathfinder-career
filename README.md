# Pathfinder — AI Career Preparation Platform

A full-stack Next.js app: upload a resume, get an AI-built knowledge map and
skill-gap analysis, generate a personalized week-by-week roadmap toward a
target company/role, learn through an AI tutor (chat + narrated video
lessons) or structured text lessons, practice with AI mock interviews that
produce a scored report, and book sessions with human mentors.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** ORM — SQLite by default (zero config), swap to Postgres for production
- **Claude (Anthropic API)** for resume analysis, roadmap generation, tutoring, lesson generation, mock interviews and scoring
- Custom **JWT + bcrypt** auth (no third-party auth vendor required)

## 1. Setup

```bash
cd career-ai-platform
npm install
cp .env.example .env
```

Edit `.env`:

- `ANTHROPIC_API_KEY` — required. Get one at https://console.anthropic.com
- `JWT_SECRET` — generate with `openssl rand -base64 32`
- `DATABASE_URL` — leave as-is for local SQLite, or point to Postgres for production

Create the database and (optionally) load demo teacher profiles:

```bash
npm run db:push
npm run db:seed
```

Run it:

```bash
npm run dev
```

Visit `http://localhost:3000`, create an account, and go through the flow:
Resume → Roadmap → AI Tutor / Learn → Mock Interview → Teachers → Dashboard.

## 2. Deploying

**Vercel (recommended for the fastest path to production):**

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Switch the Prisma datasource to Postgres (see below) — Vercel's serverless
   functions can't persist a SQLite file across requests.
4. Add `ANTHROPIC_API_KEY`, `JWT_SECRET`, `DATABASE_URL` as environment variables.
5. Deploy. `npm run build` runs `prisma generate` automatically via `postinstall`/`build`.

**Switching to Postgres** (needed for any multi-instance/serverless deploy):

In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```
Set `DATABASE_URL` to your Postgres connection string (Neon, Supabase, Railway,
RDS, etc. all work), then run `npm run db:push` once against it.

**Any Node host (Railway, Render, Fly.io, a VPS):** `npm install && npm run build && npm start` works as-is.

## 3. What's real vs. what's stubbed

Everything below is fully implemented and calls the live Claude API:

- Resume upload (PDF/DOCX) → structured analysis, resume score, weak-statement
  detection, missing-skills-for-target-role, and the "Resume Knowledge Map"
- Personalized roadmap generation + week-by-week progression
- AI Tutor (persistent chat, adapts to your resume/target role/weak areas)
- Text-based learning (notes, MCQ quiz with scoring, coding questions, interview questions)
- AI Video Tutor — narrates generated lesson content using the **browser's
  built-in speech synthesis** with a simple animated avatar, captions, and a
  pause-to-ask-a-question flow. This gives you a real working video-tutor
  experience with zero extra API cost.
- Mock interviews (technical/HR/behavioral/resume-based/coding/company-specific)
  with turn-by-turn Q&A and a final scored report (technical knowledge,
  communication, confidence, answer quality, problem-solving, strengths,
  gaps, recommended topics)
- Teacher marketplace browsing, filtering, and session booking records
- Auth, dashboard aggregating all of the above into a readiness score

**Intentionally stubbed** — these need a paid third-party vendor and API keys
that only you can provision, so they're wired with clear extension points
rather than guessed-at fake credentials:

| Feature | Current state | To make it real |
|---|---|---|
| Photoreal AI avatar for video lessons | Replaced with a lightweight animated avatar + browser TTS (fully functional, just not a photoreal face) | Swap the narration in `VideoTutorClient.tsx` for a provider like ElevenLabs (voice) + D-ID or HeyGen (avatar video), or Tavus |
| Teacher session payments | `Booking` rows are created with `status: "pending_payment"`; no money moves | Add Stripe/Razorpay Checkout in `api/teachers/book`, flip status to `confirmed` in its webhook handler |
| Live 1:1 video classes with teachers | Not built | Add WebRTC (e.g. Daily.co, Twilio Video, or LiveKit) triggered once a `Booking.status === "confirmed"` |
| "Verified" company interview data | The roadmap and interview prompts already explicitly label company-specific content as AI-generated practice material, not verified insider info (per the brief's requirement) | Only resolved by licensing real company data (e.g. Glassdoor API) if desired |

## 4. Project structure

```
src/
  app/                # pages (App Router) + API routes
    dashboard/ resume/ roadmap/ tutor/ learn/ interview/ teachers/ login/
    api/               # resume, roadmap, tutor, learn, interview, teachers, auth
  components/          # shared UI + page-level client components
  lib/                 # anthropic.ts, prisma.ts, auth.ts, resumeParser.ts, prompts.ts
  types/               # shared TS types for AI-generated structures
prisma/
  schema.prisma        # data model
  seed.ts              # demo teacher profiles
```

All Claude prompts live in `src/lib/prompts.ts` — this is the "personalized
agent" logic described in the brief (resume → skills → target role/company →
gaps → learning history → performance → what to learn next). Edit prompts
there to change tone, depth, or scoring behavior across the whole app.

## 5. Known limitations to be aware of

- Difficulty adaptation in the AI Tutor and roadmap is currently driven by
  the resume's missing-skills list and quiz scores stored in `QuizAttempt` —
  there's no full spaced-repetition or mastery-decay model yet. That's a
  reasonable next iteration once you have real usage data.
- The mock interview ends after a fixed number of exchanges (8) or when the
  user clicks "End interview" — there's no dynamic length based on answer quality.
- No email verification / password reset flow yet (auth is intentionally minimal).
