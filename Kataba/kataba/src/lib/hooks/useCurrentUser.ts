import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get the current user from the database
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/user/me');
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error('Failed to fetch current user');
      }
      return response.json();
    },
  });
} 