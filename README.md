# JobRadar

JobRadar is a personal, automated job discovery and filtering tool designed for **John Danquah-Boateng**. It aggregates remote software engineering roles from high-signal sources, scores them against a personal CV, and filters for eligibility (EMEA/Africa focus and Germany relocation).

## 🚀 Key Features

- **Automated Ingestion:** Scrapes jobs from Hacker News ("Who is Hiring"), Himalayas, and dedicated German job boards (Arbeitnow, Berlin Startup Jobs, Landing.jobs).
- **Direct ATS Tracking:** Monitored Greenhouse and Lever boards for specific high-growth startups (Gitpod, PostHog, Railway, etc.).
- **Smart Scoring:** A heuristic engine calculates a match score (0-100) based on skills, seniority, startup stage, and location compatibility.
- **Dynamic Profile:** Uses `data/profile.md` as the single source of truth for your CV and skills. Update the file, and scores update on the next fetch.
- **Location Strictness:** Automatically filters out roles that exclude Africa (e.g., "US Only") while prioritizing German roles with relocation support.
- **Modern Dashboard:** A responsive Next.js interface to manage jobs (New, Saved, Applied, Ignored) with advanced filtering (Source, Search, Frontend-only, Germany-only).
- **Gemini CLI Integration:** Includes a custom skill (`job-app-assistant`) to generate tailored cover letters and application intros.

## 🛠 Tech Stack

- **Frontend:** Next.js 15+ (App Router), React 19, Tailwind CSS, Lucide Icons.
- **Backend:** Next.js Server Actions & Route Handlers.
- **Database:** Prisma ORM with SQLite (Local).
- **Testing:** Vitest for scoring logic and scraper verification.
- **Communication:** Resend for daily email notifications (configurable).

## 🏃 Getting Started

### 1. Prerequisites
- Node.js 20+
- npm

### 2. Installation
```bash
git clone <repository-url>
cd jobradar
npm install
```

### 3. Database Setup
```bash
# Push schema to local SQLite database
npx prisma db push
# Generate Prisma Client
npx prisma generate
```

### 4. Configuration
Create a `.env` file in the root:
```env
DATABASE_URL="file:./dev.db"
RESEND_API_KEY="your_api_key_here" # Optional: for email notifications
USER_EMAIL="your_email@example.com"
```

### 5. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your dashboard.

## 📁 Project Structure

- `src/app/`: Next.js pages, actions, and API routes.
- `src/components/`: Reusable React components (JobList, DateDisplay).
- `src/lib/scrapers/`: Individual scraper modules (HN, ATS, Germany, Himalayas).
- `src/lib/scoring.ts`: The core scoring and filtering logic.
- `data/profile.md`: Your personal CV and target skills (Single Source of Truth).
- `scripts/`: Maintenance and utility scripts.
- `GEMINI.md`: foundational mandates and project context for AI agents.

## 🔧 Maintenance

### Updating your CV
Simply edit `data/profile.md` with your latest experience or skills. The next time you click **"Fetch Jobs"**, new listings will be scored against the updated profile.

### Adding New Startups to Watch
Edit the `WATCHLIST` in `src/lib/scrapers/ats.ts` to add/remove Greenhouse or Lever board IDs.

### Troubleshooting Scrapers
Use the provided test scripts to debug ingestion:
```bash
# Test ATS scraper
npx ts-node -O '{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}' scripts/test-ats.ts
```

## 🤖 AI Assistance
This project is optimized for use with **Gemini CLI**. 
- Run `/skills reload` to enable the `job-app-assistant`.
- Ask: *"Help me apply for [Job Title] at [Company] from my dashboard"* to generate tailored materials.

---
*JobRadar is a private productivity tool. Not intended for public distribution.*
