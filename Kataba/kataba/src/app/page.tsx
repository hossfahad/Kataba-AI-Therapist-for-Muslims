'use client';

import React from 'react';
import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <main className="container mx-auto">
      <h1 className="mb-4 mt-8 text-center text-3xl font-bold">
        Muslim AI Conversational Therapist
      </h1>
      <Chat />
    </main>
  );
}
