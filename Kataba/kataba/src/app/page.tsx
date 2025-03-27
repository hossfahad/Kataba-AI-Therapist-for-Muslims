'use client';

import React, { useState, useCallback } from 'react';
import { Chat } from "@/components/chat";
import { FaqSection } from "@/components/faq-section";
import { ConversationList } from "@/components/conversation-list";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Callback to close sidebar when a conversation is selected
  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);
  
  return (
    <div className="py-4 md:py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">Saved Conversations</h3>
            <Button 
              onClick={handleCloseSidebar}
              variant="ghost" 
              size="sm"
              className="text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
          <ConversationList onConversationSelect={handleCloseSidebar} />
        </div>
      </div>
      
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-light text-gray-800 mb-4 animate-fade-in">
        Kataba — Your Therapeutic Companion
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 animate-slide-up">
        Speak freely. Reflect deeply. Grow spiritually. Kataba (كَتَبَ) is your AI companion — blending therapeutic wisdom with the timeless guidance of Islamic thought.
        </p>
      </section>

      {/* Chat Interface - Now directly under the header for mobile */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-light text-gray-800">Chat</h2>
          <Button
            onClick={() => setSidebarOpen(true)}
            variant="outline"
            size="sm"
            className="lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            Saved Chats
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversation Sidebar - Only visible on desktop */}
          <div className="hidden lg:block lg:col-span-1 bg-white/50 rounded-lg p-4 shadow-sm h-[550px] md:h-[600px]">
            <ConversationList />
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-3 bg-white/5 rounded-lg p-1 h-[500px] md:h-[600px]">
            <Chat />
          </div>
        </div>
      </section>
      
      {/* About Kataba Section - Now below the chat */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-light text-gray-800 mb-3">About Kataba</h2>
            <p className="text-sm text-gray-600 mb-4">
              Kataba is an AI-powered conversational therapist designed to provide supportive guidance and reflective conversation.
            </p>
          </div>
          <div className="lg:col-span-3">
            <h3 className="text-sm font-light text-gray-700 mb-4">Key Features</h3>
            
            {/* Features Bento Grid - 3 items evenly spaced */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white/50 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-teal-100 text-teal-500 p-1 rounded-full mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-1">Voice-Enabled</span>
                    <p className="text-xs text-gray-600">
                      Type or speak to begin a guided conversation with natural voice responses
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white/50 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-teal-100 text-teal-500 p-1 rounded-full mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-1">Islamic Wisdom</span>
                    <p className="text-xs text-gray-600">
                      Reflect deeply with prompts rooted in Islamic tradition and spiritual wellness
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white/50 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-teal-100 text-teal-500 p-1 rounded-full mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-1">Private & Secure</span>
                    <p className="text-xs text-gray-600">
                      Your conversations are never used to train AI models or shared with third parties
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Below the chat */}
      <section id="how-it-works" className="mb-16">
        <h2 className="text-2xl font-light text-gray-800 mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 text-teal-500 rounded-full mb-4 animate-bounce-soft">
              1
            </div>
            <h3 className="text-lg font-light text-gray-700 mb-2">Begin with Bismillah</h3>
            <p className="text-sm text-gray-600">
            Say what&apos;s on your mind — Kataba welcomes your thoughts with compassion and calm.
            </p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 text-teal-500 rounded-full mb-4 animate-bounce-soft">
              2
            </div>
            <h3 className="text-lg font-light text-gray-700 mb-2">Speak from the Heart</h3>
            <p className="text-sm text-gray-600">
            Share your feelings or struggles. Kataba listens without judgment, rooted in values of <em>rahma</em> and <em>amanah</em>.
            </p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 text-teal-500 rounded-full mb-4 animate-bounce-soft">
              3
            </div>
            <h3 className="text-lg font-light text-gray-700 mb-2">Receive Gentle Guidance</h3>
            <p className="text-sm text-gray-600">
            Get thoughtful reflections inspired by emotional intelligence and Islamic wellness principles like <em>tawakkul</em> and <em>shukr</em>.
            </p>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <FaqSection />
    </div>
  );
}
