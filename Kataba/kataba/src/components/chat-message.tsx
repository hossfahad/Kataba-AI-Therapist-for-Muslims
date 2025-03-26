import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
      
      // Auto-scroll to the bottom as new text appears
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [displayedContent, isUser]);

  return (
    <div 
      className={cn(
        "flex gap-4 mb-6 animate-slide-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn(
        "h-10 w-10 shadow-sm transition-all",
        isUser ? "bg-pink-500 text-white" : "bg-white text-pink-500"
      )}>
        <div className="flex h-full w-full items-center justify-center">
          {isUser ? '👤' : '🤖'}
        </div>
      </Avatar>
      
      <div 
        className={cn(
          "relative max-w-[80%] p-4 rounded-2xl mb-2",
          isUser 
            ? "bg-pink-500 text-white rounded-tr-none" 
            : "glass rounded-tl-none"
        )}
      >
        <p ref={messageRef} className="text-sm font-sans leading-relaxed">
          {displayText}
          {!isUser && isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse-soft" />
          )}
        </p>
        <time className="block mt-2 text-[10px] opacity-70">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
        
        {/* Triangle pointer */}
        <div 
          className={cn(
            "absolute top-0 w-3 h-3 overflow-hidden",
            isUser ? "right-0 -translate-x-[-2px]" : "left-0 -translate-x-[2px]"
          )}
        >
          <div 
            className={cn(
              "absolute inset-0 w-full h-full rotate-45 transform origin-top-left",
              isUser ? "bg-pink-500" : "glass-triangle"
            )}
            style={{ top: '0px', left: isUser ? '100%' : '-50%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}; 