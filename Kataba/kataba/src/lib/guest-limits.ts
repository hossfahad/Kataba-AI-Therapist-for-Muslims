import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuestLimitState {
  messageCount: number;
  sessionStartTime: number;
  lastMessageTime: number;
  maxGuestMessages: number;
  incrementCount: () => void;
  resetCount: () => void;
  getRemainingMessages: () => number;
  hasReachedLimit: () => boolean;
  getTimeSinceLastMessage: () => number;
}

// Create a store to track guest user limits
export const useGuestLimitStore = create<GuestLimitState>()(
  persist(
    (set, get) => ({
      messageCount: 0,
      sessionStartTime: Date.now(),
      lastMessageTime: 0,
      maxGuestMessages: 5, // Maximum number of messages a guest can send
      
      incrementCount: () => set((state) => ({ 
        messageCount: state.messageCount + 1,
        lastMessageTime: Date.now()
      })),
      
      resetCount: () => set({
        messageCount: 0,
        sessionStartTime: Date.now(),
        lastMessageTime: 0
      }),
      
      getRemainingMessages: () => {
        const { messageCount, maxGuestMessages } = get();
        return Math.max(0, maxGuestMessages - messageCount);
      },
      
      hasReachedLimit: () => {
        const { messageCount, maxGuestMessages } = get();
        return messageCount >= maxGuestMessages;
      },
      
      getTimeSinceLastMessage: () => {
        const { lastMessageTime } = get();
        if (lastMessageTime === 0) return 0;
        return Date.now() - lastMessageTime;
      }
    }),
    {
      name: 'guest-limits-storage',
    }
  )
); 