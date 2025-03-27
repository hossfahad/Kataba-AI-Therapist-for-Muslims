import type { ReactNode } from 'react';
import type { AuthObject, SignInResource, SignUpResource, UserResource } from '@clerk/types';

declare module "@clerk/nextjs" {
  export interface ClerkProviderProps {
    children: ReactNode;
    [key: string]: any;
  }

  export const ClerkProvider: React.FC<ClerkProviderProps>;
  export const SignIn: React.FC<{[key: string]: any}>;
  export const SignUp: React.FC<{[key: string]: any}>;
  export const SignInButton: React.FC<{[key: string]: any}>;
  export const SignUpButton: React.FC<{[key: string]: any}>;
  export const UserButton: React.FC<{[key: string]: any}>;
  
  export interface AuthMiddlewareOptions {
    publicRoutes?: string[] | ((request: Request) => boolean);
    ignoredRoutes?: string[] | ((request: Request) => boolean);
    debug?: boolean;
  }
  
  export function authMiddleware(options?: AuthMiddlewareOptions): any;
  export function currentUser(): Promise<UserResource | null>;
  export function auth(): AuthObject;
} 