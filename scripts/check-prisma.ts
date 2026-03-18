import { prisma } from '@/lib/prisma';

async function diagnose() {
  console.log('--- PRISMA DIAGNOSTIC ---');
  console.log('Available models on prisma object:', Object.keys(prisma).filter(k => !k.startsWith('_')));
  
  if ('profile' in prisma) {
    console.log('SUCCESS: "profile" model is found on the prisma object.');
  } else {
    console.log('ERROR: "profile" model is MISSING from the prisma object.');
    console.log('This usually means the Prisma Client needs to be re-generated and the dev server restarted.');
  }
}

diagnose().catch(console.error);
