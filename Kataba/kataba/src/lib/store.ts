import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isMuted: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  conversationId: string | null;
  savedConversations: { id: string; title: string; updatedAt: Date }[];
  
  setAuthenticated: (isAuthenticated: boolean, userId?: string | null) => void;
  addMessage: (message: { role: 'user' | 'assistant'; content: string; }) => string;
  updateMessage: (id: string, update: string | { role: 'user' | 'assistant'; content: string; }) => void;
  setLoading: (isLoading: boolean) => void;
  toggleMute: () => void;
  clearMessages: () => void;
  saveConversation: (title?: string) => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  getSavedConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

// Generate a unique ID for messages
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Create the store with persistence
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isMuted: true,
      isAuthenticated: false,
      userId: null,
      conversationId: null,
      savedConversations: [],
      
      setAuthenticated: (isAuthenticated, userId = null) => {
        set({ isAuthenticated, userId });
        if (!isAuthenticated) {
          set({ conversationId: null, savedConversations: [] });
        } else if (userId) {
          // Load saved conversations when user is authenticated
          get().getSavedConversations();
        }
      },
      
      addMessage: (message) => {
        const id = generateId();
        const timestamp = new Date();
        set((state) => ({
          messages: [
            ...state.messages,
            { id, role: message.role, content: message.content, timestamp }
          ]
        }));
        return id;
      },
      
      updateMessage: (id, update) => {
        set((state) => ({
          messages: state.messages.map((message) => {
            if (message.id === id) {
              // Handle either string content update or object update
              if (typeof update === 'string') {
                return { ...message, content: update };
              } else {
                return { 
                  ...message, 
                  content: update.content,
                  role: update.role 
                };
              }
            }
            return message;
          })
        }));
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }));
      },
      
      clearMessages: () => {
        set({ messages: [], conversationId: null });
      },
      
      saveConversation: async (title) => {
        const { messages, userId, conversationId } = get();
        
        if (!userId || messages.length === 0) {
          throw new Error("Cannot save conversation - user not authenticated or no messages");
        }
        
        // Generate a default title from the first user message if none provided
        const conversationTitle = title || messages[0]?.content.slice(0, 50) + "...";
        
        try {
          const method = conversationId ? 'PUT' : 'POST';
          const endpoint = conversationId 
            ? `/api/conversations/${conversationId}`
            : '/api/conversations';
            
          const response = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: conversationTitle,
              messages,
              userId
            }),
          });
          
          if (!response.ok) {
            throw new Error("Failed to save conversation");
          }
          
          const data = await response.json();
          
          // Update the conversation ID in the store
          set({ conversationId: data.id });
          
          // Refresh the list of saved conversations
          await get().getSavedConversations();
          
          return data.id;
          
        } catch (error) {
          console.error("Error saving conversation:", error);
          throw error;
        }
      },
      
      loadConversation: async (conversationId) => {
        const { userId } = get();
        
        if (!userId) {
          throw new Error("User not authenticated");
        }
        
        try {
          const response = await fetch(`/api/conversations/${conversationId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error("Failed to load conversation");
          }
          
          const data = await response.json();
          
          // Update the messages and conversation ID in the store
          set({ 
            messages: data.messages,
            conversationId: data.id
          });
          
        } catch (error) {
          console.error("Error loading conversation:", error);
          throw error;
        }
      },
      
      getSavedConversations: async () => {
        const { userId } = get();
        
        if (!userId) {
          return;
        }
        
        try {
          const response = await fetch('/api/conversations', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch conversations");
          }
          
          const data = await response.json();
          
          // Update the saved conversations in the store
          set({ savedConversations: data });
          
        } catch (error) {
          console.error("Error fetching conversations:", error);
        }
      },
      
      deleteConversation: async (conversationId) => {
        const { userId } = get();
        
        if (!userId) {
          throw new Error("User not authenticated");
        }
        
        try {
          const response = await fetch(`/api/conversations/${conversationId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error("Failed to delete conversation");
          }
          
          // Refresh the list of saved conversations
          await get().getSavedConversations();
          
          // Clear current conversation if it was the one deleted
          const { conversationId: currentId } = get();
          if (currentId === conversationId) {
            set({ messages: [], conversationId: null });
          }
          
        } catch (error) {
          console.error("Error deleting conversation:", error);
          throw error;
        }
      },
    }),
    {
      name: "kataba-chat-storage",
      partialize: (state) => ({ 
        messages: state.messages,
        isMuted: state.isMuted,
        conversationId: state.conversationId 
      }),
    }
  )
); 