import { clerkMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, req) => {
  return NextResponse.next();
});

export const config = {
  matcher: '/((?!_next|favicon.ico).*)',
}; 