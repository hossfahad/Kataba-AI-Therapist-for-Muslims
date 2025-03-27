import { NextRequest, NextResponse } from 'next/server';
import { applyCustomPronunciations } from '@/lib/pronunciation';

export async function POST(req: NextRequest) {
  try {
    // Extract the text from the request
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Apply custom pronunciations to the text
    const formattedText = applyCustomPronunciations(text);
    
    // Use browser-based TTS as we've removed Cartesia
    return generateBrowserTTS(formattedText);
    
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

/**
 * Generates a response that will trigger browser's native TTS
 * @param text The text to convert to speech
 */
function generateBrowserTTS(text: string) {
  // Return a response that will tell the client to use the browser's TTS
  return NextResponse.json(
    { 
      fallback: true, 
      text: text 
    },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-TTS-Fallback': 'true'
      }
    }
  );
} 