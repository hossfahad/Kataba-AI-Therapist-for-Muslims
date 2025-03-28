import { NextResponse, NextRequest } from 'next/server';
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from '@/lib/prisma';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// GET /api/conversations - Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
    return NextResponse.json(conversations);
    
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    const user = await currentUser();
    
    console.log("POST /api/conversations - Auth check:", { userId, isAuthenticated: !!user });
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("Request body received:", {
        title: requestBody.title,
        messagesCount: requestBody.messages?.length || 0,
        saveMessageContent: requestBody.saveMessageContent
      });
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { title, messages, saveMessageContent = true } = requestBody;
    
    if (!title || !messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid request body:", { title, messages });
      return NextResponse.json(
        { error: 'Invalid request body - missing title or messages' },
        { status: 400 }
      );
    }
    
    console.log("Attempting to connect to database and create conversation");
    
    try {
      // Process messages based on privacy settings
      const processedMessages = saveMessageContent 
        ? messages 
        : messages.map((message: ChatMessage) => ({
            ...message,
            // Replace content with placeholder if privacy mode is enabled
            content: message.role === 'user' 
              ? '[Content hidden for privacy]'
              : '[Assistant response hidden for privacy]'
          }));
      
      // Store the conversation in the database
      const conversation = await prisma.conversation.create({
        data: {
          title,
          userId,
          privacyMode: !saveMessageContent, // Store the privacy setting in the database
          messages: {
            create: processedMessages.map((message: ChatMessage) => ({
              role: message.role,
              content: message.content,
              timestamp: message.timestamp || new Date(),
            })),
          },
        },
        include: {
          messages: true,
        },
      });
      
      console.log("Conversation created successfully with ID:", conversation.id);
      return NextResponse.json(conversation);
    } catch (dbError: any) {
      console.error("Database error creating conversation:", {
        error: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      });
      
      if (dbError.code === 'P1001') {
        return NextResponse.json(
          { error: 'Cannot reach database server' },
          { status: 503 }
        );
      } else if (dbError.code === 'P1003') {
        return NextResponse.json(
          { error: 'Database does not exist or is unavailable' },
          { status: 503 }
        );
      } else if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'A resource with this ID already exists' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: `Database error: ${dbError.message}` },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Unhandled error creating conversation:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 