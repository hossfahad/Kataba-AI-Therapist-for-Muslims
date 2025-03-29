import { NextRequest, NextResponse } from 'next/server';
import { getAuth, currentUser } from '@clerk/nextjs/server';
import { handleApiRequest } from '@/lib/prisma-helpers';
import { getChatCompletion } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

// Add CORS headers to responses
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle CORS preflight requests
export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  return addCorsHeaders(response);
}

// Handle chat requests
export async function POST(request: NextRequest) {
  return handleApiRequest(async () => {
    // Try to get user authentication info
    // But allow unauthenticated users for guest mode
    let userId = null;
    let isGuestMode = true;
    
    try {
      const { userId: authUserId } = await getAuth(request);
      const user = await currentUser();
      
      if (authUserId && user) {
        userId = authUserId;
        isGuestMode = false;
      }
    } catch (error) {
      console.log("User is not authenticated, proceeding in guest mode");
    }
    
    try {
      const body = await request.json();
      const { messages, conversationId, guestMessageCount = 0 } = body;
      
      // Validate request
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json(
          { error: 'Invalid request: messages array is required' },
          { status: 400 }
        );
      }
      
      // Guest mode enforcement
      const maxGuestMessages = 5;
      let reachedLimit = false;
      let remainingMessages = maxGuestMessages - guestMessageCount;
      
      // Check if guest has reached message limit
      if (isGuestMode && guestMessageCount >= maxGuestMessages) {
        // Return a message telling them to sign up
        const response = NextResponse.json({
          content: "You've reached the limit for guest messages. Please sign up to continue the conversation and save your chat history.",
          isGuestMode,
          reachedLimit: true,
          remainingMessages: 0
        });
        return addCorsHeaders(response);
      }
      
      // For guest users who are about to reach their limit, add a note to the response
      const isNearLimit = isGuestMode && (maxGuestMessages - guestMessageCount <= 1);
      
      // Call the OpenAI API to generate a response
      const content = await getChatCompletion(messages);
            
      // Save the conversation if:
      // 1. User is authenticated
      // 2. A conversation ID is provided
      if (!isGuestMode && userId && conversationId) {
        try {
          // Check if conversation exists
          const existingConversation = await prisma.conversation.findUnique({
            where: {
              id: conversationId,
              userId: userId,
            },
          });
          
          // If conversation doesn't exist, create it using the first user message as title
          if (!existingConversation) {
            const title = messages[0]?.content.slice(0, 50) + (messages[0]?.content.length > 50 ? "..." : "");
            
            await prisma.conversation.create({
              data: {
                id: conversationId,
                title,
                userId,
                messages: {
                  create: [
                    ...messages.map((message: any) => ({
                      role: message.role,
                      content: message.content,
                      timestamp: new Date(),
                    })),
                    {
                      role: 'assistant',
                      content,
                      timestamp: new Date(),
                    },
                  ],
                },
              },
            });
          } else {
            // Add the new messages to the existing conversation
            await prisma.message.createMany({
              data: [
                ...messages.filter((m: any) => m.role !== 'system').map((message: any) => ({
                  conversationId,
                  role: message.role,
                  content: message.content,
                  timestamp: new Date(),
                })),
                {
                  conversationId,
                  role: 'assistant',
                  content,
                  timestamp: new Date(),
                },
              ],
            });
            
            // Update conversation timestamp
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date() },
            });
          }
        } catch (dbError) {
          // Don't fail the API call if saving to DB fails
          // Just log the error and continue
          console.error("Error saving conversation:", dbError);
        }
      }
      
      // Modify the AI's response for guests who are close to their limit
      let modifiedContent = content;
      if (isNearLimit) {
        const limitMessage = remainingMessages === 1 
          ? "\n\nBy the way, this is your last free message as a guest. After this, you'll need to sign in to continue our conversation."
          : `\n\nBy the way, you have ${remainingMessages} free messages left as a guest. To continue beyond that, you'll need to sign in.`;
        
        modifiedContent = content + limitMessage;
      }
      
      // Return the response
      const response = NextResponse.json({
        content: modifiedContent,
        isGuestMode,
        reachedLimit,
        remainingMessages
      });
      return addCorsHeaders(response);
    } catch (error: any) {
      console.error('Error in chat API:', error);
      const response = NextResponse.json(
        { error: error.message || 'An error occurred while processing your request' },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  });
} 