'use client';

import React from 'react';
import { Chat } from "@/components/chat";

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

      <section id="how-it-works" className="mb-12">
        <h2 className="text-2xl font-light text-gray-800 mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 text-teal-500 rounded-full mb-4 animate-bounce-soft">
              1
            </div>
            <h3 className="text-lg text-gray-700 mb-2">Begin with Bismillah</h3>
            <p className="text-sm text-gray-600">
            Say what&apos;s on your mind — Kataba welcomes your thoughts with compassion and calm.
            </p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 text-teal-500 rounded-full mb-4 animate-bounce-soft">
              2
            </div>
            <h3 className="text-lg text-gray-700 mb-2">Speak from the Heart</h3>
            <p className="text-sm text-gray-600">
            Share your feelings or struggles. Kataba listens without judgment, rooted in values of <em>rahma</em> and <em>amanah</em>.
            </p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-100 text-teal-500 rounded-full mb-4 animate-bounce-soft">
              3
            </div>
            <h3 className="text-lg text-gray-700 mb-2">Receive Gentle Guidance</h3>
            <p className="text-sm text-gray-600">
            Get thoughtful reflections inspired by emotional intelligence and Islamic wellness principles like <em>tawakkul</em> and <em>shukr</em>.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
        <div className="lg:col-span-3">
          <div className="h-full flex flex-col">
              {/* <h2 className="text-lg text-gray-700 mb-2">Chat Interface</h2> */}
            <div className="flex-grow bg-white/10 rounded-lg p-1 h-[600px]">
              <Chat />
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <h2 className="text-lg text-gray-700 mb-2">About Kataba</h2>
          <p className="text-sm text-gray-600 mb-4">
            Kataba is an AI-powered conversational therapist designed to provide supportive guidance and reflective conversation.
          </p>
          <h3 className="text-sm text-gray-700 mt-4 mb-2">Key Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="bg-teal-100 text-teal-500 p-1 rounded-full">✓</span>
              Type or speak to begin a guided, voice-enabled conversation
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-teal-100 text-teal-500 p-1 rounded-full">✓</span>
              Reflect deeply with prompts rooted in Islamic tradition

            </li>
            <li className="flex items-center gap-2">
              <span className="bg-teal-100 text-teal-500 p-1 rounded-full">✓</span>
              Trust your privacy — nothing is stored or used to train AI beyond your session
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-teal-100 text-teal-500 p-1 rounded-full">✓</span>
              Resume anytime — your chat picks up right where you left off
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-teal-100 text-teal-500 p-1 rounded-full">✓</span>
              Create an account to save your journey and access personalized support
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
