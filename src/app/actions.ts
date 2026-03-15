'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
