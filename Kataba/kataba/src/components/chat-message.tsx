import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import "@/components/ui/styles.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

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
        >
          {isUser ? (
            // User messages don't need markdown
            <p>{displayText}</p>
          ) : (
            // Assistant messages use markdown and animation wrapper
            <div className="opacity-0 animate-fadeIn bg-gray-100 p-3 rounded-lg shadow-md text-black">
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
            </div>
          )}
        </div>
        
        <time className="block mt-1 text-[10px] text-gray-400 font-light">
          {messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </div>
  );
}; 