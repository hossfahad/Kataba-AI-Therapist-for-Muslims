import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "./chat-message";
import { useChatStore } from "@/lib/store";
import { getChatCompletion } from "@/lib/openai";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Chat = () => {
  const { messages, isLoading, isMuted, addMessage, setLoading, toggleMute } = useChatStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create an audio element for playing TTS
    audioRef.current = new Audio();
    
    // Set up audio context on user interaction to enable autoplay
    const enableAudio = () => {
      // This helps with browser autoplay policies
      if (audioRef.current) {
        // Create a silent buffer and play it to unblock audio
        const silentPlay = async () => {
          try {
            await audioRef.current?.play();
          } catch (e) {
            // Silent error - this is expected
          }
          // Clean up after enabling audio
          document.removeEventListener('click', enableAudio);
          document.removeEventListener('keydown', enableAudio);
        };
        
        silentPlay();
      }
    };
    
    // Enable audio on user interaction
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    return () => {
      // Cleanup audio element when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Remove event listeners
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  const speakWithCartesia = async (text: string) => {
    try {
      // Use the browser's built-in speech synthesis as a fallback
      if (!text || isMuted) return;
      
      // Call Cartesia API through our backend
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get TTS: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        try {
          // Try to play the audio
          await audioRef.current.play().catch((e) => {
            console.warn('Audio play failed, falling back to browser TTS:', e);
            // Fall back to browser TTS if autoplay is blocked
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
          });
        } catch (playError) {
          console.warn('Audio play error, using fallback:', playError);
          // Fall back to browser TTS
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error with TTS:', error);
      // Fall back to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async () => {
    const content = inputRef.current?.value.trim();
    if (!content || isLoading) return;

    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Add user message
    addMessage({ role: 'user', content });

    try {
      setLoading(true);
      
      // Get AI response
      const chatMessages = messages.map(msg => ({ role: msg.role, content: msg.content }));
      chatMessages.push({ role: 'user' as const, content });
      
      const response = await getChatCompletion(chatMessages);

      // Add AI message
      addMessage({ role: 'assistant', content: response });

      // Text-to-speech if not muted
      if (!isMuted && response) {
        await speakWithCartesia(response);
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-[90vh] flex-col gap-4 p-4">
      <ScrollArea className="flex-1 rounded-lg border p-4">
        <div className="flex flex-col gap-4">
          {messages.map((message: Message) => (
            <ChatMessage 
              key={message.id} 
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin">⏳</div>
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex gap-2">
        <Textarea
          ref={inputRef}
          placeholder="Type your message..."
          className="min-h-[80px]"
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            Send
          </Button>
          <Button
            onClick={toggleMute}
            variant="outline"
            className="flex-1"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? '🔇' : '🔊'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 