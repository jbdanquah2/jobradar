# JobRadar - Core Mandates & Project Context

This document serves as the foundational guide for the JobRadar project. All future development and maintenance must strictly adhere to the standards and context defined here.

## 1. Project Identity & Purpose
- **Target User:** John Danquah-Boateng (Location: Ghana, UTC).
- **Primary Goal:** A private, personal productivity tool to discover remote software engineering roles that are eligible for residents of Africa (EMEA focus) and startups in Germany offering relocation/visa support.
- **Non-Goal:** This is NOT a public platform or multi-user SaaS. Do not implement complex authentication or multi-tenant architecture.

## 2. Technical Architecture
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Database:** Prisma ORM with SQLite (Local dev standard).
- **Ingestion:** Scraper-based ingestion triggered via `/api/cron/ingest`.
- **Scoring Engine:** Rule-based heuristics found in `src/lib/scoring.ts` using `data/profile.md` as the single source of truth for the user's CV and skills.

## 3. Engineering Standards
- **Efficiency First:** Ingestion must minimize API calls. Avoid re-fetching or re-processing jobs already present in the database (unique `apply_url` constraint).
- **Location Strictness:** Aggressively filter out jobs that explicitly exclude Africa (e.g., "US Only", "UK Only", "Canada Only") unless they are in Germany and mention relocation.
- **Hydration Safety:** All client-side date formatting must use the `DateDisplay` component or equivalent `isMounted` checks to prevent hydration mismatches.
- **Stable Ordering:** All job lists must be primarily ordered by `status_updated_at` (DESC) and secondarily by `match_score` (DESC) and `id` (DESC) to ensure UI stability.

## 4. Job Discovery Focus
- **Priority Sources:** 
    1. Hacker News "Who is Hiring" (Early-stage startup focus).
    2. Germany-specific boards (Arbeitnow, Berlin Startup Jobs, Landing.jobs).
    3. Himalayas.app (Remote-first tech).
    4. Direct ATS Watchlist (Greenhouse/Lever for vetted startups like PostHog, Railway, etc.).
- **Startups:** Prioritize "Founding", "Seed", "Series A/B", and "Contract" roles over "Big Tech".

## 5. Maintenance Procedures
- **CV Updates:** When the user provides a new CV, update `data/profile.md` and run a manual rescan or re-ingest to update match scores.
- **Scraper Health:** Regularly verify that Greenhouse/Lever board IDs in `src/lib/scrapers/ats.ts` haven't 404'd.
- **Data Integrity:** Ensure all timestamps are stored as proper ISO strings in the database to maintain sort integrity.
