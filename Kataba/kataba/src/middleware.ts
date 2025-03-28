import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from "@clerk/nextjs";

// Function to add CORS headers to a response
function addCorsHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Create a custom middleware chain that combines Clerk auth and CORS
const clerkAuthWithCors = authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in", 
    "/sign-up",
    "/api/webhook",
    "/api/webhook/clerk",
    "/api/trpc/(.*)",
    "/api/health",
  ],
});

// Main middleware handler
export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Special handling for CORS preflight requests
  if (request.method === 'OPTIONS' && path.startsWith('/api/')) {
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
  
  // Process the request through Clerk auth middleware
  const clerkResponse = clerkAuthWithCors(request);
  
  // Add CORS headers for API routes
  if (path.startsWith('/api/') && clerkResponse) {
    return addCorsHeaders(clerkResponse);
  }
  
  return clerkResponse;
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 