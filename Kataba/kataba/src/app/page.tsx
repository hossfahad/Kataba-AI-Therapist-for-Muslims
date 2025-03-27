'use client';

import React from 'react';
import { Chat } from "@/components/chat";
import { FaqSection } from "@/components/faq-section";
import { ConversationList } from "@/components/conversation-list";

export default function Home() {
  return (
    <div className="py-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <section className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-light text-gray-800 mb-4 animate-fade-in">
        Kataba — Your Therapeutic Companion
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-slide-up">
        Speak freely. Reflect deeply. Grow spiritually. Kataba (كَتَبَ) is your AI companion — blending therapeutic wisdom with the timeless guidance of Islamic thought.
        </p>
      </section>

      {/* About Kataba Section - Now above the chat */}
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

      {/* Chat Interface with Sidebar */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversation Sidebar */}
          <div className="lg:col-span-1 bg-white/50 rounded-lg p-4 shadow-sm h-[600px]">
            <ConversationList />
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-3 bg-white/10 rounded-lg p-1 h-[600px]">
            <Chat />
          </div>
        </div>
      </section>

      {/* How It Works - Now below the chat */}
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
