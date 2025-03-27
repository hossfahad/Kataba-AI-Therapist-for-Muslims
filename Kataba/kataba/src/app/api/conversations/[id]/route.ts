import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/conversations/[id] - Get a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const conversationId = params.id;
    
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(conversation);
    
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[id] - Update a conversation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const conversationId = params.id;
    const { title, messages } = await request.json();
    
    // First, verify the conversation exists and belongs to the user
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: userId,
      },
    });
    
    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Update the conversation title
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        title,
        updatedAt: new Date(),
      },
    });
    
    // Delete all existing messages
    await prisma.message.deleteMany({
      where: {
        conversationId,
      },
    });
    
    // Create new messages
    await prisma.message.createMany({
      data: messages.map((message: { role: string; content: string; timestamp?: Date }) => ({
        conversationId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || new Date(),
      })),
    });
    
    // Get the updated conversation
    const updatedConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });
    
    return NextResponse.json(updatedConversation);
    
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const conversationId = params.id;
    
    // First, verify the conversation exists and belongs to the user
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: userId,
      },
    });
    
    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Delete the conversation (this will cascade delete messages due to the relation)
    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 