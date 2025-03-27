import type { ReactNode } from 'react';
import type { AuthObject, UserResource } from '@clerk/types';

declare module "@clerk/nextjs" {
  export interface ClerkProviderProps {
    children: ReactNode;
    customizations?: Record<string, unknown>;
  }

  export const ClerkProvider: React.FC<ClerkProviderProps>;
  export const SignIn: React.FC<Record<string, unknown>>;
  export const SignUp: React.FC<Record<string, unknown>>;
  export const SignInButton: React.FC<Record<string, unknown>>;
  export const SignUpButton: React.FC<Record<string, unknown>>;
  export const UserButton: React.FC<Record<string, unknown>>;
  
  export interface AuthMiddlewareOptions {
    publicRoutes?: string[] | ((request: Request) => boolean);
    ignoredRoutes?: string[] | ((request: Request) => boolean);
    debug?: boolean;
  }
  
  export function authMiddleware(options?: AuthMiddlewareOptions): unknown;
  export function currentUser(): Promise<UserResource | null>;
  export function auth(): AuthObject;
} 