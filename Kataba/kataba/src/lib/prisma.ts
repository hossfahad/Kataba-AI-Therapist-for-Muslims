import { PrismaClient } from '@prisma/client';

// Log the DATABASE_URL (but mask the password)
const dbUrl = process.env.DATABASE_URL || '';
console.log('Database connection string:', dbUrl.replace(/:(.*?)@/, ':****@'));

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn', 'info'] : ['error'],
  });

// Add error handler to check for connection issues
prisma.$use(async (params: any, next: any) => {
  try {
    return await next(params);
  } catch (error: any) {
    console.error(`Prisma Error in ${params.model}.${params.action}:`, {
      error: error.message,
      code: error.code,
      meta: error.meta
    });
    throw error;
  }
});

// Test the database connection on app startup
async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error: any) {
    console.error('❌ Database connection failed:', {
      message: error.message,
      code: error.code
    });
  }
}

// Run the test in development only
if (process.env.NODE_ENV !== 'production') {
  testConnection();
  globalForPrisma.prisma = prisma;
} 