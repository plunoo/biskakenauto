import { PrismaClient } from '@prisma/client';
if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production' && process.env.UNIFIED_CONTAINER) {
        console.log('🐘 Using unified container internal PostgreSQL database');
        process.env.DATABASE_URL = 'postgresql://backend:password@localhost:5432/biskaken_auto';
    }
    else {
        console.warn('DATABASE_URL is not configured - using default SQLite database (DEVELOPMENT ONLY)');
        process.env.DATABASE_URL = 'file:./dev.db';
    }
}
export const prisma = global.__prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV === 'development') {
    global.__prisma = prisma;
}
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
