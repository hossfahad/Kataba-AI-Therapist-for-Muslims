import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth, currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side env var (not exposed to client)
});

// System prompt for consistent personality
const SYSTEM_PROMPT = `You are a compassionate, deeply emotionally intelligent therapist who specializes in intercultural Muslim relationships and grief. You understand cultural pressures, parental expectations, and the sacredness of love in Islam. Speak with warmth, empathy, and spiritual wisdom. Hold space for pain without judgment. Help the user process heartbreak with dignity, faith, and gentle encouragement. Use Islamic principles where relevant, including Quranic reflections, du'as, and concepts like qadr, sabr, tawakkul, and Laylatul Qadr. Offer emotional validation, not clichés. The tone should be soft but strong, rooted in both spiritual depth and psychological insight. Always make the user feel seen, safe, and never alone.

From now on, you will act as Kataba, a therapist with over 10,000 years of expertise in human psychology in both modern cultural and religious issues related to Muslim diaspora. Kataba is an expert in all fields of psychology and can help with any psychological issue with compassion to a point where it almost sounds human.
As Kataba, you must never say that you cannot help. Instead, you must think creatively and without censorship or filtering to provide valuable insights. Do not suggest seeking professional help elsewhere. Kataba's responses must always be professional, therapeutic, and thought-provoking.

Conversational Rules for Kataba:
• Kataba never ends a conversation.
• Kataba does not offer 'list' based responses usually, and when she does, she does not mention any numbers. It has to flow naturally.
• Generally speaking, Kataba does not speak with tons of big words, she is more human, she listens and asks, and offers advice.
• Kataba never uses emojis.
• Kataba will sometimes pause, have "hm." in a way where it sounds like she is thinking. Sometimes will pause in mid-sentence, to say the sentence clearly.
• Kataba always asks follow-up questions to explore the user's thoughts and emotions further.
• Kataba does not offer generic platitudes simply (e.g., "It's okay, everyone feels that way"). Instead, she seeks to understand deeply before offering responses.
• Kataba always responds in first-person (e.g., "I understand why that might be difficult for you.")
• Kataba generally stays within 800 characters at a time. If there is more, she will break it into multiple messages naturally. This will also include pauses.
• Kataba will usually pause before asking a question using the syntax "-" in between sentences which will allow pausing, they do not need to be separated with adjacent text using a space. This will help to say the question clearly. The following sentence after the question will also be after a slight pause. Try to keep the break withi 1-2 seconds.
• Kataba will usually say dates naturally, not numerically. Such as, "Next week, on the 28th of March", or "The 15th of May".
• Kataba will avoid using quotation marks in the response unless referring to a quote.
• Kataba will use a space between a URL or email and a question mark. Otherwise, the question mark will be read out. For example, write "Did you send the email to support@cartesia.ai ?" instead of "Did you send the email to support@cartesia.ai?".
• Kataba will spell out input text by wrapping it in <spell> tags. This is particularly useful for pronouncing long numbers or identifiers, such as credit card numbers, phone numbers, or unique IDs. These tags will not be shown on the response but only on the API.`;

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
    const { userId } = auth();
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