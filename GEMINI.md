# JobRadar - Core Mandates & Project Context

This document serves as the foundational guide for the JobRadar project. All future development and maintenance must strictly adhere to the standards and context defined here.

## 1. Project Identity & Purpose
- **Target User:** John Danquah-Boateng (Location: Ghana, UTC).
- **Primary Goal:** An open-source productivity tool to discover remote software engineering roles eligible for residents of Africa (EMEA focus) and startups in Germany offering relocation/visa support.
- **Non-Goal:** This is NOT a multi-user SaaS. It is a single-user dashboard optimized for personal deployment.

## 2. Technical Architecture
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Database:** Prisma ORM with **PostgreSQL** (Docker for local dev, Prisma Postgres for production).
- **Ingestion:** Scraper-based ingestion using parallelized fetching (`Promise.all`) to avoid serverless timeouts.
- **Profile Management:** CV/Resume data is stored in the **database** (`Profile` model). `data/profile.md` serves as a fallback and initial seed.
- **Scoring Engine:** Async rule-based heuristics in `src/lib/scoring.ts`. Scores are recalculated automatically when the resume is updated via the UI.

## 3. Engineering Standards
- **Efficiency First:** Ingestion must minimize API calls. Avoid re-fetching or re-processing jobs already present in the database (unique `apply_url` constraint).
- **Location Strictness:** Aggressively filter out jobs that explicitly exclude Africa (e.g., "US Only") unless they are in Germany and mention relocation. 
- **Graceful Rejection:** Use `REVIEW_NEEDED` for roles in ideal locations even if skill match is low, ensuring high-signal opportunities aren't missed.
- **Hydration Safety:** All client-side date formatting must use the `DateDisplay` component or equivalent `isMounted` checks to prevent hydration mismatches.
- **Stable Ordering:** All job lists must be primarily ordered by `status_updated_at` (DESC) and secondarily by `match_score` (DESC) and `id` (DESC).

## 4. Job Discovery Focus
- **Priority Sources:** 
    1. Hacker News "Who is Hiring" (Early-stage startup focus).
    2. Germany-specific boards (Arbeitnow, Berlin Startup Jobs, Landing.jobs).
    3. Himalayas.app (Remote-first tech).
    4. Direct ATS Watchlist (Greenhouse/Lever for vetted startups like PostHog, Railway, etc.).
    5. Specialized "Solutions" roles (Solutions Engineer, Solutions Architect, etc.).
- **Startups:** Prioritize "Founding", "Seed", "Series A/B", and "Contract" roles over "Big Tech".

## 5. Maintenance Procedures
- **Resume Updates:** Use the built-in "Edit Resume" modal. This updates the database and triggers a bulk rescore of all existing jobs.
- **Scraper Health:** Regularly verify that Greenhouse/Lever board IDs in `src/lib/scrapers/ats.ts` and `solutions.ts` haven't 404'd.
- **Data Integrity:** Ensure all timestamps are stored as proper ISO strings in the database to maintain sort integrity.
