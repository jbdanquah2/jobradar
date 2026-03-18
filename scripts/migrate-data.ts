import Database from 'better-sqlite3';
import { prisma } from '../src/lib/prisma';
import path from 'path';

async function migrate() {
  console.log('--- STARTING SQLITE TO POSTGRES MIGRATION ---');
  
  const sqlitePath = path.join(process.cwd(), 'prisma/dev.db');
  console.log(`Reading from: ${sqlitePath}`);
  
  const db = new Database(sqlitePath);
  
  // 1. Migrate Jobs
  try {
    const jobs = db.prepare('SELECT * FROM Job').all() as any[];
    console.log(`Found ${jobs.length} jobs in SQLite.`);
    
    let migratedCount = 0;
    for (const job of jobs) {
      // Upsert to Postgres
      await prisma.job.upsert({
        where: { apply_url: job.apply_url },
        update: {
          status: job.status,
          status_updated_at: new Date(job.status_updated_at),
          match_score: job.match_score,
          eligibility_status: job.eligibility_status,
        },
        create: {
          id: job.id,
          title: job.title,
          company: job.company,
          location_text: job.location_text,
          remote_type: job.remote_type,
          description: job.description,
          apply_url: job.apply_url,
          source: job.source,
          date_posted: new Date(job.date_posted),
          skills_detected: job.skills_detected,
          match_score: job.match_score,
          eligibility_status: job.eligibility_status,
          status: job.status,
          status_updated_at: new Date(job.status_updated_at),
          created_at: new Date(job.created_at),
          updated_at: new Date(job.updated_at),
        }
      });
      migratedCount++;
    }
    console.log(`Successfully migrated/updated ${migratedCount} jobs.`);
  } catch (err) {
    console.error('Error migrating jobs:', err);
  }

  // 2. Migrate Profile (if it exists)
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Profile'").get();
    if (tableCheck) {
      const profile = db.prepare('SELECT * FROM Profile WHERE id = "singleton"').get() as any;
      if (profile) {
        console.log('Found Profile in SQLite. Migrating...');
        await prisma.profile.upsert({
          where: { id: 'singleton' },
          update: { content: profile.content },
          create: { id: 'singleton', content: profile.content }
        });
        console.log('Profile migrated.');
      }
    }
  } catch (err) {
    console.log('No Profile table found in SQLite or error reading it. Skipping profile migration.');
  }

  console.log('--- MIGRATION COMPLETE ---');
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
