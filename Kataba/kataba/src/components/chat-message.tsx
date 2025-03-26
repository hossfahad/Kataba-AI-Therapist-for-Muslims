import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import "@/components/ui/styles.css";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  displayedContent?: string;
}

export const ChatMessage = ({ 
  role, 
  content, 
  timestamp, 
  isStreaming = false,
  displayedContent 
}: ChatMessageProps) => {
  const isUser = role === 'user';
  const [displayText, setDisplayText] = useState(isUser ? content : (displayedContent || ''));
  const messageRef = useRef<HTMLParagraphElement>(null);

  // If this is the assistant and we're not streaming, display the full content
  useEffect(() => {
    if (!isUser && !isStreaming && content !== displayText) {
      setDisplayText(content);
    }
  }, [content, displayText, isUser, isStreaming]);

  // Update display text when streaming new content
  useEffect(() => {
    if (!isUser && displayedContent !== undefined) {
      setDisplayText(displayedContent);
    }
  }, [displayedContent, isUser]);

  return (
    <div 
      className={cn(
        "w-full mb-4 animate-slide-in floating-container",
        isUser ? "flex justify-end" : "flex justify-start"
      )}
    >      
      <div 
        className={cn(
          "relative max-w-[85%] p-4 rounded-2xl",
          isUser 
            ? "gradient-pink text-white shadow-md shadow-pink-200/20" 
            : "glass-bubble text-gray-800"
        )}
      >
        <p 
          ref={messageRef} 
          className="text-base font-medium leading-relaxed font-['Inter','Open Sans',sans-serif]"
        >
          {displayText}
          {!isUser && isStreaming && (
            <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse-soft" />
          )}
        </p>
        <time className="block mt-2 text-[10px] opacity-70 font-light">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </div>
  );
}; 