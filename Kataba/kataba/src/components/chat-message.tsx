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
  // Split text into sentences or segments based on punctuation
  const segments = text
    .split(/([.!?]\s+)/)
    .filter(Boolean)
    .reduce((acc: string[], segment, index) => {
      // Join segments back together if they were split by punctuation
      if (index % 2 === 1 && acc.length > 0) {
        acc[acc.length - 1] += segment;
      } else {
        acc.push(segment);
      }
      return acc;
    }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animatedTextStyles }} />
      {segments.map((segment, index) => (
        <span 
          key={index} 
          className="animated-text"
          style={{ 
            animationDelay: `${index * 0.2}s`,
            display: 'inline-block',
            textAlign: isRTL ? 'right' : 'left'
          }}
        >
          {segment}{' '}
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
              {isStreaming || !isAnimated ? (
                // During streaming or before animation, show regular markdown
                <>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      p: ({ node, ...props }) => (
                        <p className="mb-3 last:mb-0" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-5 mb-3" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-5 mb-3" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 className="text-xl font-medium mb-3 mt-4" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-lg font-medium mb-3 mt-4" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-md font-medium mb-2 mt-3" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-gray-200 pl-4 italic my-3" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a className="text-teal-600 hover:underline" {...props} />
                      ),
                      code: ({ node, className, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !props.block;
                        return isInline 
                          ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                          : <code className="block bg-gray-100 p-2 rounded-md my-3 text-sm font-mono whitespace-pre-wrap" {...props} />;
                      },
                      pre: ({ node, ...props }) => (
                        <pre className="bg-gray-100 p-2 rounded-md my-3 overflow-auto" {...props} />
                      ),
                    }}
                  >
                    {displayText}
                  </ReactMarkdown>
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse-soft" />
                  )}
                </>
              ) : (
                // After streaming completes, show animated text
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