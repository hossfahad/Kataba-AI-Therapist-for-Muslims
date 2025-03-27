'use client';

import { useState, useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';

export const ConversationList = () => {
  const { user, isSignedIn } = useUser();
  const {
    savedConversations,
    loadConversation,
    deleteConversation,
    saveConversation,
    messages,
    clearMessages,
    conversationId,
    setAuthenticated
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set authentication status when user auth state changes
  useEffect(() => {
    if (user && isSignedIn) {
      setAuthenticated(true, user.id);
    } else {
      setAuthenticated(false);
    }
  }, [user, isSignedIn, setAuthenticated]);

  // Track active conversation status
  const isActive = conversationId !== null;
  
  const handleLoadConversation = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await loadConversation(id);
    } catch (err) {
      setError('Failed to load conversation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    setIsLoading(true);
    setError(null);
    try {
      await deleteConversation(id);
    } catch (err) {
      setError('Failed to delete conversation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveConversation = async () => {
    if (messages.length === 0) {
      setError('Cannot save an empty conversation');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If this is a new conversation, prompt for a title
      let title;
      if (!conversationId) {
        title = prompt('Enter a title for this conversation:', 
          messages[0]?.content.slice(0, 30) + '...'
        );
        
        // If user cancels the prompt, abort the save
        if (title === null) {
          setIsLoading(false);
          return;
        }
      }
      
      await saveConversation(title);
    } catch (err) {
      setError('Failed to save conversation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewConversation = () => {
    clearMessages();
  };
  
  // If user is not signed in, show a message
  if (!isSignedIn || !user) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-gray-600 mb-4">Sign in to save your conversations</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">Your Conversations</h3>
        <div className="flex space-x-2">
          <Button
            onClick={handleNewConversation}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            New
          </Button>
          <Button
            onClick={handleSaveConversation}
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={isLoading || messages.length === 0}
          >
            Save
          </Button>
        </div>
      </div>
      
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      
      <div className="overflow-y-auto flex-grow">
        {savedConversations.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4">No saved conversations</p>
        ) : (
          <ul className="space-y-2">
            {savedConversations.map((convo) => (
              <li 
                key={convo.id}
                className={`p-2 rounded-md cursor-pointer transition-colors
                  ${conversationId === convo.id 
                    ? 'bg-teal-50 border border-teal-200' 
                    : 'hover:bg-gray-100 border border-transparent'
                  }`}
                onClick={() => handleLoadConversation(convo.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 truncate">
                    {conversationId === convo.id && (
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-soft"></div>
                        <span className="text-xs text-teal-600 font-medium">Active</span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-700 truncate">{convo.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(convo.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(convo.id, e)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    aria-label="Delete conversation"
                  >
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
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 