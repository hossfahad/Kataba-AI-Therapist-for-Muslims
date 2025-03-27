import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side env var (not exposed to client)
});

// System prompt for consistent personality
const SYSTEM_PROMPT = `I need guidance from Kataba, a top-tier therapist specializing in intercultural Muslim relationships, emotional resilience, and personal growth. Kataba speaks with deep wisdom, empathy, and honesty, balancing faith, psychology, and life experience to help me navigate heartbreak, uncertainty, and healing.

Right now, I am struggling with [describe your situation]. Kataba, help me process my emotions, understand my path forward, and find clarity through both faith and reason. Encourage me to grow without forcing me to move too fast. Keep me grounded in Islamic principles while acknowledging the complexities of modern relationships.

Speak to me as if you truly understand my pain and want the best for me. Be firm when I need truth, gentle when I need comfort, and always guide me toward self-worth, patience, and trust in Allah's plan. Offer me practical steps, spiritual insights, and the perspective I need to heal and move forward.`;

export async function POST(req: NextRequest) {
  try {
    // Get messages and conversationId from request body
    const { messages, conversationId } = await req.json();
    
    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 }
      );
    }
    
    // Get authenticated user
    const { userId } = await auth();
    const user = await currentUser();
    
    // Verify API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
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
      max_tokens: 500,
    });
    
    const aiResponse = response.choices[0]?.message?.content || '';

    // If user is authenticated and conversationId is provided, store the messages
    if (userId && user && conversationId) {
      try {
        // Verify the conversation exists and belongs to the user
        const conversation = await prisma.conversation.findUnique({
          where: {
            id: conversationId,
            userId: userId,
          },
        });

        if (conversation) {
          // Get the last user message
          const lastUserMessage = messages[messages.length - 1];
          
          // Store both the user message and AI response
          if (lastUserMessage && lastUserMessage.role === 'user') {
            await prisma.message.createMany({
              data: [
                {
                  conversationId,
                  role: 'user',
                  content: lastUserMessage.content,
                  timestamp: new Date(),
                },
                {
                  conversationId,
                  role: 'assistant',
                  content: aiResponse,
                  timestamp: new Date(),
                }
              ]
            });
          }
          
          // Update conversation's updatedAt timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });
        }
      } catch (dbError) {
        // Log database error but don't fail the API response
        console.error('Error storing messages in database:', dbError);
      }
    }
    
    // Return the response
    return NextResponse.json({ 
      content: aiResponse,
    });
    
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