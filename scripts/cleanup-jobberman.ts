import { prisma } from '../src/lib/prisma';

async function cleanupJobberman() {
  console.log('--- STARTING CLEANUP: source="jobberman_nigeria" ---');

  const countBefore = await prisma.job.count({
    where: { source: 'jobberman_nigeria' }
  });
  console.log(`Found ${countBefore} jobs with source="jobberman_nigeria".`);

  if (countBefore === 0) {
    console.log('No jobs found. Skipping deletion.');
    return;
  }

  const result = await prisma.job.deleteMany({
    where: { source: 'jobberman_nigeria' }
  });

  console.log(`--- CLEANUP COMPLETE: Deleted ${result.count} jobs ---`);
}

cleanupJobberman()
  .catch((err) => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
