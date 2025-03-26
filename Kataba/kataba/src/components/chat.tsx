import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "./chat-message";
import { useChatStore } from "@/lib/store";
import { getChatCompletion } from "@/lib/openai";
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Chat = () => {
  const { 
    messages, 
    isLoading, 
    isMuted, 
    addMessage, 
    updateMessage, 
    setLoading, 
    toggleMute 
  } = useChatStore();
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [currentAssistantMessageId, setCurrentAssistantMessageId] = useState<string | null>(null);

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
  }, [messages, streamedText]);

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
      setIsStreaming(true);
      setStreamedText("");
      
      // Get AI response
      const chatMessages = messages.map(msg => ({ role: msg.role, content: msg.content }));
      chatMessages.push({ role: 'user' as const, content });
      
      // Add placeholder assistant message
      const assistantMessageId = addMessage({ 
        role: 'assistant', 
        content: '' 
      });
      setCurrentAssistantMessageId(assistantMessageId);
      
      // Get the full response
      const response = await getChatCompletion(chatMessages);
      
      // Start TTS as early as possible to reduce latency
      if (!isMuted && response) {
        // Fire and forget - this will play in the background while we stream text
        speakWithCartesia(response);
      }
      
      // Split response into words and display them one by one
      const words = response.split(' ');
      
      // Process words one by one with slight delays
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Adjust timing as needed
        const partialResponse = words.slice(0, i + 1).join(' ');
        setStreamedText(partialResponse);
      }
      
      // Update the assistant message with the full content
      updateMessage(assistantMessageId, {
        role: 'assistant',
        content: response
      });
      
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setCurrentAssistantMessageId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 relative overflow-hidden rounded-xl glass-card">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 chat-header">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse-soft"></div>
          <span className="text-sm text-gray-800">Active Conversation</span>
        </div>
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 rounded-full", 
            isMuted ? "text-gray-300" : "text-pink-500"
          )}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          )}
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 animate-bounce-soft"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <p className="text-sm">Start a conversation to begin</p>
            </div>
          ) : (
            messages.map((message: Message) => (
              <ChatMessage 
                key={message.id} 
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                isStreaming={isStreaming && message.id === currentAssistantMessageId}
                displayedContent={message.id === currentAssistantMessageId ? streamedText : undefined}
              />
            ))
          )}
          {isLoading && !isStreaming && (
            <div className="flex items-center gap-3 text-sm text-gray-400 py-2 px-4 self-start glass-card mt-4 animate-pulse-soft">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "200ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "400ms" }}></div>
              </div>
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator className="bg-gray-100" />

      {/* Input area */}
      <div className="p-4 flex gap-2">
        <Textarea
          ref={inputRef}
          placeholder="Type your message..."
          className="min-h-[60px] max-h-[120px] flex-1 resize-none glass placeholder:text-gray-300 text-sm font-sans focus-visible:ring-gray-200"
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-pink-500 hover:bg-pink-600 text-white h-auto px-4 self-end"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M22 2 11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          Send
        </Button>
      </div>
    </div>
  );
}; 