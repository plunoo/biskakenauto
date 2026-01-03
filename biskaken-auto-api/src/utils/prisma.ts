import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var __prisma: PrismaClient | undefined;
}

// Set default DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not configured - using default SQLite database (DEVELOPMENT ONLY)');
  process.env.DATABASE_URL = 'file:./dev.db';
}

export const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});