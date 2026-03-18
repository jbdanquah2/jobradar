# JobRadar

JobRadar is an open-source, automated job discovery and filtering tool designed for software engineers. It aggregates remote engineering roles from high-signal sources, scores them against your personal resume, and filters for eligibility (with a focus on EMEA/Africa and Germany relocation).

## 🚀 Key Features

- **Automated Ingestion:** Scrapes jobs from Hacker News ("Who is Hiring"), Himalayas, and dedicated German job boards (Arbeitnow, Berlin Startup Jobs, Landing.jobs).
- **Specialized Roles:** Targeted scrapers for **Solutions Engineer**, **Solutions Architect**, and **Developer Solutions** roles.
- **Direct ATS Tracking:** Monitors Greenhouse and Lever boards for specific high-growth startups (Stripe, Cloudflare, PostHog, Railway, etc.).
- **Smart Scoring:** A heuristic engine calculates a match score (0-100) based on skills, seniority, startup stage, and location compatibility.
- **Database-Backed Resume:** Edit and preview your CV/Resume directly in the UI. Match scores are automatically recalculated across all jobs whenever you save changes.
- **Location Strictness:** Automatically filters out roles that explicitly exclude your region (e.g., "US Only") while prioritizing German roles with relocation support.
- **Modern Dashboard:** A responsive Next.js interface to manage jobs (New, Saved, Applied, Ignored) with inline job details and advanced filtering.
- **Onboarding Guide:** Built-in setup guide to help new users configure their profile and trigger their first ingestion.

## 🛠 Tech Stack

- **Framework:** Next.js 15+ (App Router), React 19, Tailwind CSS.
- **Database:** Prisma ORM with **PostgreSQL** (Docker for local, Prisma Postgres/Vercel Postgres for production).
- **UI Components:** Lucide Icons, Headless UI, Radix UI.
- **Markdown:** `marked` and `dompurify` for safe resume rendering.
- **Communication:** Resend for daily email notifications (optional).

## 🏃 Getting Started

### 1. Prerequisites
- Node.js 20+
- **Docker Desktop** (for local PostgreSQL)
- npm

### 2. Installation
```bash
git clone <repository-url>
cd jobradar
npm install
```

### 3. Database Setup (Local)
Ensure Docker is running, then:
```bash
# Start a local PostgreSQL instance
docker compose up -d

# Sync the schema to the database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Configuration
Create a `.env` file in the root:
```env
# Local Development (Docker)
DATABASE_URL="postgresql://user:password@localhost:5432/jobradar"

# Vercel Production (Set these in Vercel Dashboard)
# DATABASE_URL: Provided by Prisma Postgres or Vercel Postgres

RESEND_API_KEY="your_api_key_here" # Optional
USER_EMAIL="your_email@example.com"
```

### 5. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your dashboard.

## 🔧 Maintenance

### Updating your Resume
Use the **"Edit Resume"** button in the dashboard header. You can paste your markdown CV and preview it in real-time. Saving will trigger a bulk rescore of all existing jobs in the database.

### Adding New Startups to Watch
- Edit `WATCHLIST` in `src/lib/scrapers/ats.ts` for general engineering roles.
- Edit `SOLUTIONS_WATCHLIST` in `src/lib/scrapers/solutions.ts` for solutions-focused roles.

### Troubleshooting Scrapers
Use the provided test scripts to debug ingestion:
```bash
# Test specific scrapers
npx tsx scripts/test-ats.ts
```

## 🤖 AI Assistance
This project is optimized for use with **Gemini CLI**. 
- Run `/skills reload` to enable the `job-app-assistant`.
- Ask: *"Help me apply for [Job Title] at [Company] from my dashboard"* to generate tailored cover letters and intros.

---
*JobRadar is an open-source productivity tool for software engineers.*
