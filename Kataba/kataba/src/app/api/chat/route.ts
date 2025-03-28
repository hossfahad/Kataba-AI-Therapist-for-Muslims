import { NextRequest, NextResponse } from 'next/server';
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from '@/lib/prisma';
import { getOpenAICompletion } from '@/lib/openai-direct';

// Helper function to add CORS headers
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return corsHeaders(NextResponse.json({}, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    const user = await currentUser();
    
    if (!userId || !user) {
      return corsHeaders(NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ));
    }
    
    // Get messages from request body
    const { messages } = await request.json();
    
    if (!Array.isArray(messages)) {
      return corsHeaders(NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 }
      ));
    }
    
    try {
      // Call OpenAI API directly using our utility function
      const content = await getOpenAICompletion(
        messages.map(({ role, content }: { role: string; content: string }) => ({ 
          role: role as 'user' | 'assistant', 
          content 
        }))
      );
      
      // Return the response
      return corsHeaders(NextResponse.json({ content }));
    } catch (error: unknown) {
      console.error('Detailed OpenAI API error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = (error as any)?.status === 401 ? 401 : 500;
      
      return corsHeaders(NextResponse.json(
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
      ));
    }
  } catch (error: unknown) {
    console.error('Error in chat API route:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return corsHeaders(NextResponse.json(
      { 
        error: 'Failed to get response from AI',
        message: errorMessage,
      },
      { status: 500 }
    ));
  }
} 