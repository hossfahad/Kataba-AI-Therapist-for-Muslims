import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import "@/components/ui/styles.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { useLanguage } from "@/lib/hooks/useLanguage";

// Styles for the surging animation effect
const animatedTextStyles = `
  @keyframes fadeInBursts {
    0% { opacity: 0; }
    20% { opacity: 1; }
    35% { opacity: 0.7; }
    50% { opacity: 1; }
    70% { opacity: 0.8; }
    100% { opacity: 1; }
  }
  
  .animated-text {
    opacity: 0;
    animation: fadeInBursts 1.5s ease-out forwards;
  }
`;

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  displayedContent?: string;
}

// Component to render text with the surging animation effect
const AnimatedTextRenderer = ({ text, isRTL }: { text: string; isRTL: boolean }) => {
  // Split text into words
  const words = text.split(/\s+/).filter(Boolean);
  
  // Group words into chunks of 2-4 words for more natural bursts
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  
  words.forEach((word, index) => {
    currentChunk.push(word);
    
    // Create a new chunk every 2-4 words (randomized) or at punctuation
    const isPunctuation = /[.!?]$/.test(word);
    const chunkSize = Math.floor(Math.random() * 3) + 2; // Random between 2-4
    
    if (isPunctuation || currentChunk.length >= chunkSize || index === words.length - 1) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animatedTextStyles }} />
      {chunks.map((chunk, index) => (
        <span 
          key={index} 
          className="animated-text"
          style={{ 
            animationDelay: `${index * 0.15}s`,
            display: 'inline-block',
            textAlign: isRTL ? 'right' : 'left'
          }}
        >
          {chunk}{' '}
        </span>
      ))}
    </>
  );
};

export const ChatMessage = ({ 
  role, 
  content, 
  timestamp, 
  isStreaming = false,
  displayedContent 
}: ChatMessageProps) => {
  const isUser = role === 'user';
  const [displayText, setDisplayText] = useState(isUser ? content : (displayedContent || ''));
  const [isAnimated, setIsAnimated] = useState(false);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const { isRTL } = useLanguage();

  // If this is the assistant and we're not streaming, display the full content
  useEffect(() => {
    if (!isUser && !isStreaming && content !== displayText) {
      setDisplayText(content);
      
      // Only animate when the streaming is complete (not during streaming)
      if (!isStreaming && content && content.length > 0) {
        setIsAnimated(true);
      }
    }
  }, [content, displayText, isUser, isStreaming]);

  // Update display text when streaming new content
  useEffect(() => {
    if (!isUser && displayedContent !== undefined) {
      setDisplayText(displayedContent);
      setIsAnimated(false); // Reset animation when streaming new content
    }
  }, [displayedContent, isUser]);

  // Ensure timestamp is a valid Date object
  const messageTime = timestamp instanceof Date ? timestamp : new Date();

  return (
    <div className="w-full my-5 animate-slide-in">      
      <div className={cn(
        "px-2",
        isUser ? "text-right" : "text-left"
      )}>
        <div className="mb-1">
          <span className={cn(
            "text-xs font-medium",
            isUser ? "text-teal-600" : "text-gray-500"
          )}>
            {isUser ? "You" : "Kataba"}
          </span>
        </div>
        
        <div
          ref={messageRef}
          className={cn(
            "markdown-content text-base leading-relaxed font-['Inter','Open Sans',sans-serif]",
            isUser ? "text-teal-700" : "text-gray-800"
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {isUser ? (
            // User messages don't need animation or markdown
            <p>{displayText}</p>
          ) : (
            // Assistant messages use markdown with animation when ready
            <>
              {isStreaming ? (
                // When actively streaming, just show loading indicators instead of partial text
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "200ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce-soft" style={{ animationDelay: "400ms" }}></div>
                </div>
              ) : (
                // When message is complete, apply the animated rendering
                <AnimatedTextRenderer text={displayText} isRTL={isRTL} />
              )}
            </>
          )}
        </div>
        
        <time className="block mt-1 text-[10px] text-gray-400 font-light">
          {messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </div>
  );
}; 