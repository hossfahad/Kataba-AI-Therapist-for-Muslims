import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "./chat-message";
import { useChatStore } from "@/lib/store";
import { getChatCompletion } from "@/lib/openai";
import { cn } from '@/lib/utils';
import "@/components/ui/styles.css";
import { useGuestLimitStore } from '@/lib/guest-limits';
import { useUser } from "@clerk/nextjs";
import { PrivacyToggle } from './privacy-toggle';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { LanguageCode } from '@/lib/languages';

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
    toggleMute,
    isAuthenticated
  } = useChatStore();
  const { user } = useUser();
  const { messageCount, incrementCount, hasReachedLimit, getRemainingMessages } = useGuestLimitStore();
  const { currentLanguage, setLanguage } = useLanguage();
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [currentAssistantMessageId, setCurrentAssistantMessageId] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(true);

  // State for guest limit notification
  const [showGuestLimitBanner, setShowGuestLimitBanner] = useState(false);
  const [reachedLimit, setReachedLimit] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(5);

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
    const inputValue = inputRef.current?.value?.trim();
    if (!inputValue || isLoading) return;

    // Don't allow sending if guest has reached message limit
    if (!user && hasReachedLimit()) {
      setReachedLimit(true);
      setShowGuestLimitBanner(true);
      return;
    }

    // Clear input and focus
    if (inputRef.current) {
      const value = inputRef.current.value;
      inputRef.current.value = '';
      inputRef.current.focus();
    }

    setLoading(true);
    setIsStreaming(false);

    try {
      // Add user message to chat
      addMessage({
        role: 'user',
        content: inputValue,
      });

      // Scroll to the message
      scrollToBottom();

      // Increment guest message count if not authenticated
      if (!user) {
        incrementCount();
      }

      // Create a temporary message for the assistant
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: '',
      });

      // Set current assistant message ID for streaming
      setCurrentAssistantMessageId(assistantMessageId);

      // Scroll to the temporary message
      scrollToBottom();

      // Start streaming state
      setIsStreaming(true);
      setStreamedText('');

      // Get the conversation ID from the store
      const { conversationId } = useChatStore.getState();
      const currentGuestCount = useGuestLimitStore.getState().messageCount;

      // Get all messages for context
      const allMessages = useChatStore.getState().messages;

      // Call the API endpoint with language preference
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          conversationId,
          guestMessageCount: currentGuestCount,
          preferredLanguage: currentLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Get the response data
      const data = await response.json();
      const { content, isGuestMode, reachedLimit: apiReachedLimit, remainingMessages: apiRemainingMessages, detectedLanguage } = data;

      // Update detected language if needed
      if (detectedLanguage && detectedLanguage !== currentLanguage) {
        setLanguage(detectedLanguage as LanguageCode);
      }

      // Update guest mode information
      if (isGuestMode) {
        setRemainingMessages(apiRemainingMessages);
        setReachedLimit(apiReachedLimit);
        
        // Show banner if this was the last message or close to limit
        if (apiRemainingMessages <= 1) {
          setShowGuestLimitBanner(true);
        }
      }

      // Update the assistant message with the response
      updateMessage(assistantMessageId, content);

      // Stop streaming
      setIsStreaming(false);
      setCurrentAssistantMessageId(null);

      // Speak the text if audio is enabled
      await speakText(content);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add an error message if the request fails
      if (currentAssistantMessageId) {
        updateMessage(
          currentAssistantMessageId,
          "I'm sorry, but I'm having trouble connecting to my services right now. Please try again later."
        );
      }
      
      // Reset streaming state
      setIsStreaming(false);
      setCurrentAssistantMessageId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle mobile viewport adjustments when keyboard is shown
  useEffect(() => {
    const handleResize = () => {
      // Only run this on mobile devices (viewport width < 768px)
      if (window.innerWidth < 768) {
        // This helps ensure the input is visible when keyboard appears
        window.scrollTo(0, document.body.scrollHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-64px)] overflow-hidden">
      {/* Chat messages container */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-sans font-light text-gray-700">Welcome to Kataba</h2>
              <p className="text-sm text-gray-500">
                Your personal therapist specializing in Muslim relationships, emotional healing, and personal growth.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isStreaming={isStreaming && currentAssistantMessageId === message.id}
              streamedContent={currentAssistantMessageId === message.id ? streamedText : undefined}
            />
          ))
        )}
      </div>

      {/* Guest limit banner */}
      {showGuestLimitBanner && (
        <div className="bg-amber-50 border-t border-amber-200 p-3 text-center">
          <p className="text-sm text-amber-800">
            {reachedLimit 
              ? "You've reached the guest message limit. Sign up for free to continue chatting!" 
              : `You have ${remainingMessages} messages left as a guest. Sign up to get unlimited access!`}
          </p>
          <a 
            href="/sign-up" 
            className="mt-2 inline-block text-xs font-medium px-3 py-1 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
          >
            Sign up now
          </a>
        </div>
      )}

      {/* API unavailable warning */}
      {!isApiAvailable && (
        <div className="bg-red-50 border-t border-red-200 p-2 text-center">
          <p className="text-sm text-red-700">
            We're having trouble connecting to our servers. Please try again later.
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-start space-x-2">
          <Textarea
            ref={inputRef}
            placeholder={`Type a message (${currentLanguage.toUpperCase()})...`}
            className={cn(
              "min-h-12 resize-none p-3 rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            onKeyDown={handleKeyDown}
            disabled={isLoading || (hasReachedLimit() && !user)}
            dir={currentLanguage === 'ar' || currentLanguage === 'ur' ? 'rtl' : 'ltr'}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (hasReachedLimit() && !user)}
              className={cn(
                "px-3 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </Button>
            <PrivacyToggle />
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={toggleMute}
            className="text-xs text-gray-500 hover:text-teal-500 transition-colors"
          >
            {isMuted ? (
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Sound Off
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                Sound On
              </span>
            )}
          </button>
          
          <p className="text-xs text-gray-400">
            {messages.length === 0
              ? "Ask me anything - I'm here to help."
              : user
              ? ""
              : hasReachedLimit()
              ? "Sign up to continue chatting"
              : `${getRemainingMessages()} messages left as guest`}
          </p>
        </div>
      </div>
    </div>
  );
}; 