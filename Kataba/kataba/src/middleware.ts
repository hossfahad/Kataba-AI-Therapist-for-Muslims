import { clerkMiddleware } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, req) => {
  // Allow public access to the chat API endpoint
  if (req.nextUrl.pathname === '/api/chat') {
    return NextResponse.next();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: '/((?!_next|favicon.ico).*)',
}; 