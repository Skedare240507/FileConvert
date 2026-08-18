import { prisma } from './backend/db/client';

async function main() {
  console.log('Testing Prisma connection...');
  try {
    const user = await prisma.user.findFirst();
    console.log('DB connection successful!', user);
  } catch (e) {
    console.error('DB connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
