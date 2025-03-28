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
  lastAutoSaveTime: number;
  
  // Privacy setting
  saveMessageContent: boolean;
  
  setAuthenticated: (isAuthenticated: boolean, userId?: string | null) => void;
  addMessage: (message: { role: 'user' | 'assistant'; content: string; }) => string;
  updateMessage: (id: string, content: string | { role: 'user' | 'assistant'; content: string }) => void;
  setLoading: (isLoading: boolean) => void;
  toggleMute: () => void;
  clearMessages: () => void;
  saveConversation: (title?: string) => Promise<string>;
  loadConversation: (conversationId: string) => Promise<void>;
  getSavedConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  autoSaveConversation: () => Promise<void>;
  
  // Privacy methods
  setSaveMessageContent: (saveContent: boolean) => void;
  toggleSaveMessageContent: () => void;
}

// Generate a unique ID for messages
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Auto-save delay in milliseconds (3 seconds)
const AUTO_SAVE_DELAY = 3000;

// Minimum messages needed before auto-saving
const MIN_MESSAGES_FOR_AUTOSAVE = 2;

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
      lastAutoSaveTime: 0,
      
      // Default to saving message content (opt-out of privacy by default)
      saveMessageContent: true,
      
      setAuthenticated: (isAuthenticated, userId = null) => {
        set({ isAuthenticated, userId });
        if (!isAuthenticated) {
          set({ conversationId: null, savedConversations: [] });
        } else if (userId) {
          // Load saved conversations when user is authenticated
          get().getSavedConversations();
        }
      },
      
      // Privacy methods
      setSaveMessageContent: (saveContent) => {
        set({ saveMessageContent: saveContent });
      },
      
      toggleSaveMessageContent: () => {
        set((state) => ({ saveMessageContent: !state.saveMessageContent }));
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
        
        // Try to auto-save after a brief delay
        // This allows for subsequent messages to be added (like AI responses)
        // before auto-saving occurs
        setTimeout(() => {
          get().autoSaveConversation();
        }, AUTO_SAVE_DELAY);
        
        return id;
      },
      
      updateMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id 
              ? typeof content === 'string' 
                ? { ...message, content } 
                : { ...message, role: content.role, content: content.content }
              : message
          )
        }));
        
        // Try to auto-save after a message is updated
        setTimeout(() => {
          get().autoSaveConversation();
        }, AUTO_SAVE_DELAY);
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
      
      autoSaveConversation: async () => {
        const { 
          messages, 
          userId, 
          conversationId, 
          isAuthenticated, 
          lastAutoSaveTime,
          saveMessageContent 
        } = get();
        
        // Only auto-save if:
        // 1. User is authenticated
        // 2. There are enough messages to save
        // 3. We haven't auto-saved too recently
        // 4. The conversation is not already saved or has new messages since last save
        const now = Date.now();
        if (
          !isAuthenticated || 
          !userId || 
          messages.length < MIN_MESSAGES_FOR_AUTOSAVE ||
          now - lastAutoSaveTime < AUTO_SAVE_DELAY
        ) {
          return;
        }
        
        try {
          // Update the last auto-save time
          set({ lastAutoSaveTime: now });
          
          // Generate a title from the first user message
          const firstUserMessage = messages.find(m => m.role === 'user');
          if (!firstUserMessage) return;
          
          const title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
          
          // Call the save function
          await get().saveConversation(title);
          
        } catch (error) {
          console.error("Auto-save failed:", error);
          // Don't throw the error - just log it to avoid disrupting the UI
        }
      },
      
      saveConversation: async (title) => {
        const { messages, userId, conversationId, saveMessageContent } = get();
        
        if (!userId || messages.length === 0) {
          console.error("Cannot save conversation - user not authenticated or no messages", { userId, messagesLength: messages.length });
          throw new Error("Cannot save conversation - user not authenticated or no messages");
        }
        
        // Generate a default title from the first user message if none provided
        const conversationTitle = title || messages[0]?.content.slice(0, 50) + "...";
        
        try {
          const method = conversationId ? 'PUT' : 'POST';
          const endpoint = conversationId 
            ? `/api/conversations/${conversationId}`
            : '/api/conversations';
          
          // Prepare messages based on privacy settings
          const messagesToSave = saveMessageContent 
            ? messages 
            : messages.map(message => ({
                ...message,
                // Replace content with placeholder if privacy mode is enabled
                content: message.role === 'user' 
                  ? '[Content hidden for privacy]'
                  : '[Assistant response hidden for privacy]'
              }));
          
          console.log(`Saving conversation to ${endpoint} with method ${method}`, { 
            title: conversationTitle,
            messagesCount: messages.length,
            userId,
            saveMessageContent
          });
          
          const response = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: conversationTitle,
              messages: messagesToSave,
              userId,
              saveMessageContent
            }),
          });
          
          // Log the response status and details
          console.log(`Save conversation response status: ${response.status}`);
          const responseText = await response.text();
          
          try {
            // Try to parse the response as JSON
            const data = JSON.parse(responseText);
            console.log('Response data:', data);
            
            if (!response.ok) {
              console.error(`Server error: ${data.error || 'Unknown error'}`);
              throw new Error(data.error || "Failed to save conversation");
            }
            
            // Update the conversation ID and last auto-save time in the store
            set({ 
              conversationId: data.id,
              lastAutoSaveTime: Date.now()
            });
            
            // Refresh the list of saved conversations
            await get().getSavedConversations();
            
            return data.id;
          } catch (parseError) {
            // If the response isn't valid JSON, log the raw text
            console.error('Could not parse response as JSON:', responseText);
            throw new Error(`Failed to save conversation. Server response: ${responseText}`);
          }
          
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
            conversationId: data.id,
            lastAutoSaveTime: Date.now() // Reset auto-save timer when loading a conversation
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
        conversationId: state.conversationId,
        saveMessageContent: state.saveMessageContent
      }),
    }
  )
); 