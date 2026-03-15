import { prisma } from '../src/lib/prisma';

async function main() {
  const deletedCount = await prisma.job.deleteMany({
    where: { source: 'RemoteOK' }
  });
  console.log(`Successfully deleted ${deletedCount.count} RemoteOK jobs.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
