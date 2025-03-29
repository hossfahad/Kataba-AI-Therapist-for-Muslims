import { NextRequest, NextResponse } from 'next/server';
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from '@/lib/prisma';
import { getOpenAICompletion } from '@/lib/openai-direct';

// Define constants
const MAX_GUEST_MESSAGES = 5; // Maximum allowed guest messages

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
    // Try to get authentication information, but proceed even if not authenticated
    const auth = await getAuth(request);
    const userId = auth.userId;
    const user = await currentUser();
    
    // Guest mode flag - true if user is not authenticated
    const isGuestMode = !userId || !user;
    
    // Get messages from request body
    const { messages, conversationId, guestMessageCount } = await request.json();
    
    if (!Array.isArray(messages)) {
      return corsHeaders(NextResponse.json(
        { error: 'Invalid request: messages must be an array' },
        { status: 400 }
      ));
    }
    
    // Check guest message limits if in guest mode
    if (isGuestMode) {
      if (guestMessageCount >= MAX_GUEST_MESSAGES) {
        // If guest has reached their limit, return a special response prompting them to sign up
        return corsHeaders(NextResponse.json({
          content: "I've enjoyed our conversation! To continue chatting with me and save your conversations, please sign up for an account. It's free and only takes a moment.",
          isGuestMode: true,
          reachedLimit: true,
          remainingMessages: 0
        }));
      }
    }
    
    try {
      // Determine if this is the last message for a guest user
      const isLastGuestMessage = isGuestMode && guestMessageCount === MAX_GUEST_MESSAGES - 1; // One away from the limit
      
      // Get the user's actual message content
      const userMessage = messages[messages.length - 1]?.content || '';
      
      // Modify the final AI response for guests to encourage sign-up
      let finalPrompt = '';
      if (isLastGuestMessage) {
        finalPrompt = `\n\nBy the way, this is your last free message. To continue our conversation and save your chat history, please consider signing up for an account. It's free and only takes a moment.`;
      }
      
      // Call OpenAI API directly using our utility function - works for all users
      const content = await getOpenAICompletion(
        messages.map(({ role, content }: { role: string; content: string }) => ({ 
          role: role as 'user' | 'assistant', 
          content 
        }))
      );
      
      // Add sign-up prompt if this is the last message
      const finalContent = isLastGuestMessage ? content + finalPrompt : content;
      
      // Save conversation if user is authenticated and requested it
      if (!isGuestMode && conversationId) {
        try {
          // Save the message to the database
          // This operation is optional and doesn't affect the API response
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: finalContent,
              conversationId,
            },
          });
        } catch (dbError) {
          // Log database errors but don't fail the request
          console.error('Failed to save message to database:', dbError);
        }
      }
      
      // Return the response with information about guest mode and remaining messages
      return corsHeaders(NextResponse.json({ 
        content: finalContent,
        isGuestMode,
        reachedLimit: isGuestMode && guestMessageCount >= MAX_GUEST_MESSAGES - 1,
        remainingMessages: isGuestMode ? Math.max(0, MAX_GUEST_MESSAGES - guestMessageCount - 1) : null
      }));
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