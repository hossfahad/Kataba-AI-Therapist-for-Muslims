'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the auth context type
interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: { email: string; password: string; name?: string }) => Promise<void>;
  signInWithProvider: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Default context state
const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithProvider: async () => {},
  signOut: async () => {},
};

// Create the auth context
const AuthContext = createContext<AuthContextType>(defaultContext);

// Auth Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check session when component mounts
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Sign in with email/password
  const signIn = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'email-password',
          ...credentials
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign in');
      }

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        router.refresh();
        router.push('/');
      }
    } catch (error: Error | unknown) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email/password
  const signUp = async (credentials: { email: string; password: string; name?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sign up');
      }
      
      // Auto sign in after successful sign up
      await signIn({ email: credentials.email, password: credentials.password });
    } catch (error: Error | unknown) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with OAuth provider
  const signInWithProvider = async (provider: string) => {
    try {
      // Redirect to provider's OAuth flow
      window.location.href = `/api/auth/signin?provider=${provider}`;
    } catch (error: Error | unknown) {
      console.error(`Sign in with ${provider} failed:`, error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
      router.refresh();
      router.push('/');
    } catch (error: Error | unknown) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 