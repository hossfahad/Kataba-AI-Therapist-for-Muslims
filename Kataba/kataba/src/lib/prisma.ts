import { PrismaClient } from '@prisma/client/edge';

// Log the DATABASE_URL (but mask the password)
const dbUrl = process.env.DATABASE_URL || '';
console.log('Database connection string:', dbUrl.replace(/:(.*?)@/, ':****@'));

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Prisma client with limited connections
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "&pool_timeout=30&connection_limit=4&pool_max_connections=4"
    }
  }
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
  } finally {
    // Don't disconnect here as we need the client for the app
  }
}

// Run the test in development only
if (process.env.NODE_ENV !== 'production') {
  testConnection();
  globalForPrisma.prisma = prisma;
}

// Ensure proper cleanup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma }; 