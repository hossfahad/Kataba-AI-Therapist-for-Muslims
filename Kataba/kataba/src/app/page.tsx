'use client';

import React from 'react';
import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="py-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <section className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4 animate-fade-in">
          Your AI Therapeutic Companion
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-slide-up">
          Connect with Kataba for thoughtful conversations, guided reflection, and mental wellness support.
        </p>
      </section>

      <section id="how-it-works" className="mb-12">
        <h2 className="text-2xl font-light text-gray-800 mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-pink-100 text-pink-500 rounded-full mb-4 animate-bounce-soft">
              1
            </div>
            <h3 className="text-lg text-gray-700 mb-2">Start a Conversation</h3>
            <p className="text-sm text-gray-600">
              Type or speak to begin your therapeutic journey with Kataba.
            </p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-pink-100 text-pink-500 rounded-full mb-4 animate-bounce-soft">
              2
            </div>
            <h3 className="text-lg text-gray-700 mb-2">Share Your Thoughts</h3>
            <p className="text-sm text-gray-600">
              Express your feelings, concerns, or questions in a safe, judgment-free space.
            </p>
          </div>
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-pink-100 text-pink-500 rounded-full mb-4 animate-bounce-soft">
              3
            </div>
            <h3 className="text-lg text-gray-700 mb-2">Receive Guidance</h3>
            <p className="text-sm text-gray-600">
              Get thoughtful responses and supportive guidance tailored to your needs.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
        <div className="lg:col-span-3">
          <div className="h-full flex flex-col">
            <h2 className="text-lg text-gray-700 mb-2">Chat Interface</h2>
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
              <span className="bg-pink-100 text-pink-500 p-1 rounded-full">✓</span>
              Voice-enabled conversations
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-pink-100 text-pink-500 p-1 rounded-full">✓</span>
              Thoughtful, empathetic responses
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-pink-100 text-pink-500 p-1 rounded-full">✓</span>
              Privacy-focused design
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-pink-100 text-pink-500 p-1 rounded-full">✓</span>
              Guided reflection exercises
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
