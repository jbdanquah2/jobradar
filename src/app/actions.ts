'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { calculateJobMatch, getProfileData } from '@/lib/scoring';
import { performIngestion } from '@/lib/ingest';

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
  try {
    const result = await performIngestion();
    revalidatePath('/');
    return result;
  } catch (error) {
    console.error('Action Ingestion failed:', error);
    throw new Error('Failed to fetch jobs. Check logs.');
  }
}

export async function getProfileContent() {
  const profile = await getProfileData();
  return profile.fullContent;
}

export async function updateProfileContent(newContent: string) {
  // Update DB
  await prisma.profile.upsert({
    where: { id: 'singleton' },
    update: { content: newContent },
    create: { id: 'singleton', content: newContent }
  });
  
  // Parse the new content for rescoring
  // We call getProfileData to get the refined keywords logic
  const profileData = await getProfileData();

  // Rescore all jobs
  const jobs = await prisma.job.findMany();
  
  for (const job of jobs) {
    const scoredJob = await calculateJobMatch({
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
    }, profileData);

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
