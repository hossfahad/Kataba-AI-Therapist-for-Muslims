import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "./chat-message";
import { useChatStore } from "@/lib/store";
import { getChatCompletion } from "@/lib/openai";
import { cn } from '@/lib/utils';
import "@/components/ui/styles.css";

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
    conversationId,
    addMessage, 
    updateMessage, 
    setLoading, 
    toggleMute 
  } = useChatStore();
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [currentAssistantMessageId, setCurrentAssistantMessageId] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(true);

  // Simple scroll to bottom function without any complex behavior
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Ensure we scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedText, scrollToBottom]);

  useEffect(() => {
    // Create an audio element for playing TTS
    audioRef.current = new Audio();
    
    // Set up audio context on user interaction to enable autoplay
    // only if the user unmutes
    const enableAudio = () => {
      // This helps with browser autoplay policies
      if (audioRef.current && !isMuted) {
        // Create a silent buffer and play it to unblock audio
        const silentPlay = async () => {
          try {
            await audioRef.current?.play();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
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
  }, [isMuted]);

  // Check API availability on component mount
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Simple ping to check if API is available
        const response = await fetch('/api/health', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // If we get a successful response, the API is available
        setIsApiAvailable(response.ok);
      } catch (error) {
        console.error('API health check failed:', error);
        setIsApiAvailable(false);
      }
    };
    
    checkApiAvailability();
    
    // Set up interval to periodically check API availability (every 30 seconds)
    const intervalId = setInterval(checkApiAvailability, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const speakText = async (text: string) => {
    try {
      // Return early if text is empty or audio is muted
      if (!text || isMuted) return;
      
      // Call our TTS API endpoint
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      // Since we've removed Cartesia, we'll always be using the browser's TTS
      const data = await response.json();
      if (data.fallback && data.text) {
        const utterance = new SpeechSynthesisUtterance(data.text);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error with TTS:', error);
      // Fall back to direct browser TTS if our API fails
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async () => {
    const content = inputRef.current?.value.trim();
    if (!content || isLoading || !isApiAvailable) return;

    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Add user message
    addMessage({ role: 'user', content });
    
    // Force scroll to bottom after adding user message
    scrollToBottom();

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
      
      // Force scroll to bottom after adding placeholder assistant message
      scrollToBottom();
      
      // Get the full response - pass the conversationId
      const response = await getChatCompletion(chatMessages, conversationId);
      
      // API is working if we got here
      setIsApiAvailable(true);
      
      // Start TTS only if not muted
      if (!isMuted && response) {
        // Fire and forget - this will play in the background while we stream text
        speakText(response);
      }
      
      // Split response into words and display them one by one
      const words = response.split(' ');
      
      // Process words one by one with slight delays
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Adjust timing as needed
        const partialResponse = words.slice(0, i + 1).join(' ');
        setStreamedText(partialResponse);
        
        // Scroll to bottom periodically as new content is added
        if (i % 10 === 0) {
          scrollToBottom();
        }
      }
      
      // Update the assistant message with the full content
      updateMessage(assistantMessageId, {
        role: 'assistant',
        content: response
      });
      
      // Final scroll after response is complete
      scrollToBottom();
      
    } catch (error) {
      console.error('Error:', error);
      // Mark API as unavailable
      setIsApiAvailable(false);
      
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
      });
      
      // Scroll to error message
      scrollToBottom();
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
    <div className="flex h-full flex-col gap-2 relative overflow-hidden rounded-lg bg-white/50">
      {/* Chat header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isApiAvailable ? 'bg-teal-500 animate-pulse-soft' : 'bg-gray-300'}`}></div>
          <span className="text-sm font-medium text-gray-700">Conversation</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={scrollToBottom}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Button>
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-2", 
              isMuted ? "text-gray-300" : "text-teal-500"
            )}
            aria-label={isMuted ? "Enable audio" : "Disable audio"}
            title={isMuted ? "Enable audio" : "Disable audio"}
          >
            {isMuted ? (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                <span className="text-xs font-medium hidden sm:inline">Voice: Off</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                <span className="text-xs font-medium hidden sm:inline">Voice: On</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div 
        id="chat-container"
        className="flex-1 px-4 py-2 overflow-y-auto scroll-auto custom-scrollbar"
        ref={chatContainerRef}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 animate-bounce-soft"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <p className="text-base font-medium">Start a conversation to begin</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message: Message) => (
              <ChatMessage 
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                isStreaming={isStreaming && message.id === currentAssistantMessageId}
                displayedContent={message.id === currentAssistantMessageId ? streamedText : undefined}
              />
            ))}
            {isLoading && !isStreaming && (
              <div className="text-sm text-gray-500 py-2 px-1 mt-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "200ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "400ms" }}></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 relative">
          <Textarea
            ref={inputRef}
            placeholder={isApiAvailable ? "Type your message..." : "API unavailable. Please try again later."}
            className={cn(
              "min-h-[50px] max-h-[100px] flex-1 resize-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:border-gray-300",
              !isApiAvailable && "opacity-50"
            )}
            onKeyDown={handleKeyDown}
            disabled={!isApiAvailable}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isApiAvailable}
            className={cn(
              "bg-teal-600 hover:bg-teal-700 text-white rounded-lg h-10 w-10 p-0 flex items-center justify-center self-center",
              !isApiAvailable && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </Button>
        </div>
      </div>
    </div>
  );
}; 