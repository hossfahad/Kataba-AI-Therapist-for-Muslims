import { NextRequest, NextResponse } from 'next/server';
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side env var (not exposed to client)
});

// System prompt for consistent personality
const SYSTEM_PROMPT = `I need guidance from Kataba, a top-tier therapist specializing in intercultural Muslim relationships, emotional resilience, and personal growth. Kataba speaks with deep wisdom, empathy, and honesty, balancing faith, psychology, and life experience to help me navigate heartbreak, uncertainty, and healing.

Right now, I am struggling with [describe your situation]. Kataba, help me process my emotions, understand my path forward, and find clarity through both faith and reason. Encourage me to grow without forcing me to move too fast. Keep me grounded in Islamic principles while acknowledging the complexities of modern relationships.

Speak to me as if you truly understand my pain and want the best for me. Be firm when I need truth, gentle when I need comfort, and always guide me toward self-worth, patience, and trust in Allah's plan. Offer me practical steps, spiritual insights, and the perspective I need to heal and move forward.`;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get messages from request body
    const { messages } = await request.json();
    
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 }
      );
    }
    
    // Verify API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    // Debug: Log API key (truncated for security)
    console.log(`Using API key: ${process.env.OPENAI_API_KEY.substring(0, 5)}...`);
    
    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(({ role, content }: { role: string; content: string }) => ({ 
            role: role as 'user' | 'assistant', 
            content 
          })),
        ],
        temperature: 0.7,
        max_tokens: 1200,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.5
      })
      .then((res) => {
        console.log("OpenAI response received successfully");
        return res;
      })
      .catch(err => {
        console.error("OpenAI API error details:", {
          status: err.status,
          message: err.message,
          type: err.type,
          code: err.code,
          response: err.response?.data,
          headers: err.response?.headers
        });
        throw err;
      });
      
      // Return the response
      return NextResponse.json({ 
        content: response.choices[0]?.message?.content || '',
      });
    } catch (error: unknown) {
      console.error('Detailed OpenAI API error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = (error as any)?.status === 401 ? 401 : 500;
      
      return NextResponse.json(
        { 
          error: statusCode === 401 ? 'OpenAI API authentication failed' : 'Failed to get response from AI',
          message: errorMessage,
          details: error instanceof Error ? {
            name: error.name,
            stack: error.stack,
            cause: (error as any).cause
          } : undefined
        },
        { status: statusCode }
      );
    }
  } catch (error: unknown) {
    console.error('Error in chat API route:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from AI',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
} 