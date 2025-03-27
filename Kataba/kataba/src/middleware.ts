import { clerkMiddleware } from '@clerk/nextjs/server';

// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information
export default clerkMiddleware();

// See https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  matcher: [
    // Match all paths except for:
    // - Static files ending with extensions (.jpg, .png, etc)
    // - Internal Next.js paths (_next)
    '/((?!.*\\..*|_next).*)',
    // API routes
    '/(api|trpc)(.*)',
  ],
}; 