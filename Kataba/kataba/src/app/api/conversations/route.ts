import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// GET /api/conversations - Get all conversations for the current user
export async function GET() {
  try {
    const { userId } = auth();
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
export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { title, messages } = await request.json();
    
    if (!title || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Store the conversation in the database
    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId,
        messages: {
          create: messages.map((message: ChatMessage) => ({
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
    
    return NextResponse.json(conversation);
    
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 