import { create } from 'zustand';

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
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updatedMessage: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  toggleMute: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  isMuted: true,
  addMessage: (message) => {
    const id = crypto.randomUUID();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id,
          timestamp: new Date(),
        },
      ],
    }));
    return id;
  },
  updateMessage: (id, updatedMessage) => 
    set((state) => ({
      messages: state.messages.map(msg => 
        msg.id === id 
          ? { ...msg, ...updatedMessage, timestamp: new Date() } 
          : msg
      )
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
})); 