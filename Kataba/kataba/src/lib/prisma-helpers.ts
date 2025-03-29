import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

/**
 * Wraps a handler function with proper Prisma connection management
 * Ensures prisma.$disconnect() is called after the request completes
 */
export async function withPrisma<T>(
  handler: () => Promise<T>
): Promise<T> {
  try {
    return await handler();
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Helper for API routes to handle requests with proper Prisma disconnection
 * Example usage:
 * 
 * export async function GET(request) {
 *   return await handleApiRequest(async () => {
 *     const data = await prisma.example.findMany();
 *     return NextResponse.json(data);
 *   });
 * }
 */
export async function handleApiRequest(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 