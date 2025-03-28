import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORS middleware function
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only handle API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  // For API requests, continue but add CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// Configure middleware to run only on API routes
export const config = {
  matcher: ['/api/:path*'],
}; 