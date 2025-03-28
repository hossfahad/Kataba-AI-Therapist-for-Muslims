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
  ],
});

export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes that already have CORS middleware
    // - Static files with extensions
    // - Internal Next.js paths like _next/image
    "/((?!api|.*\\..*|_next/static|_next/image|favicon.ico).*)",
  ],
}; 