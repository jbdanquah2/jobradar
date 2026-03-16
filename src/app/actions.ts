'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { calculateJobMatch } from '@/lib/scoring';

export async function updateJobStatus(id: string, status: string) {
  // First update status
  await prisma.job.update({
    where: { id },
    data: { 
      status,
      // We wrap this in a try-catch or ensure the client is absolutely ready
      status_updated_at: new Date()
    }
  });
  
  revalidatePath('/');
}

export async function triggerIngestion() {
  const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const res = await fetch(`${host}/api/cron/ingest`);
  const data = await res.json();
  revalidatePath('/');
  return data;
}

export async function getProfileContent() {
  const profilePath = path.join(process.cwd(), 'data/profile.md');
  return fs.readFileSync(profilePath, 'utf-8');
}

export async function updateProfileContent(newContent: string) {
  const profilePath = path.join(process.cwd(), 'data/profile.md');
  fs.writeFileSync(profilePath, newContent, 'utf-8');
  
  // Rescore all jobs
  const jobs = await prisma.job.findMany();
  
  for (const job of jobs) {
    const scoredJob = calculateJobMatch({
      title: job.title,
      company: job.company,
      location_text: job.location_text,
      remote_type: job.remote_type,
      description: job.description,
      apply_url: job.apply_url,
      source: job.source,
      date_posted: job.date_posted,
      skills_detected: job.skills_detected,
      match_score: 0,
      eligibility_status: 'REVIEW_NEEDED',
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        match_score: scoredJob.match_score,
        eligibility_status: scoredJob.eligibility_status,
      }
    });
  }

  revalidatePath('/');
}
