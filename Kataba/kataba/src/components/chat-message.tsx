import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8">
        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
          {isUser ? '👤' : '🤖'}
        </div>
      </Avatar>
      <Card className={`max-w-[80%] p-4 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <p className="text-sm">{content}</p>
        <time className="mt-2 text-xs opacity-50">
          {timestamp.toLocaleTimeString()}
        </time>
      </Card>
    </div>
  );
}; 