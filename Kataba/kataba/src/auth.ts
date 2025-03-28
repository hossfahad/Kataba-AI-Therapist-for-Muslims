import { authMiddleware } from "@clerk/nextjs";

// See https://clerk.com/docs/references/nextjs/auth-middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook",
    "/api/webhook/clerk",
    "/api/trpc/(.*)",
    "/api/health",
    "/api/chat",
  ],
});

export const config = {
  matcher: [
    // Match all paths except API routes (handled by CORS middleware),
    // static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}; 