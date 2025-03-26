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

    // Get Cartesia API key from environment variables
    // Use the NEXT_PUBLIC_ prefixed value since that's what's defined in .env.local
    const cartesiaApiKey = process.env.NEXT_PUBLIC_CARTESIA_API_KEY || process.env.CARTESIA_API_KEY;
    
    if (!cartesiaApiKey) {
      console.error('Cartesia API key is not configured');
      return NextResponse.json(
        { error: 'TTS service is not properly configured' },
        { status: 500 }
      );
    }

    try {
      // Call Cartesia API
      const response = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'Cartesia-Version': '2024-06-10',
          'X-API-Key': cartesiaApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: 'sonic-2',
          transcript: formattedText, // Now using text with custom pronunciations
          voice: {
            mode: 'id',
            id: 'a38e4e85-e815-43ab-acf1-907c4688dd6c', // Keeping the existing voice ID
            __experimental_controls: {
              speed: -0.2 // Keeping the existing speed control
            }
          },
          output_format: {
            container: 'mp3',
            encoding: 'pcm_f32le',
            sample_rate: 44100,
            bit_rate: 128000
          },
          language: 'en'
        }),
      });

      if (!response.ok) {
        console.error('Cartesia API error:', await response.text());
        
        // Fall back to browser's Web Speech API
        return generateFallbackAudio(text);
      }

      // Get audio data
      const audioArrayBuffer = await response.arrayBuffer();
      
      // Return the audio data
      return new NextResponse(audioArrayBuffer, {
        headers: {
          'Content-Type': 'audio/mp3',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (error) {
      console.error('Cartesia API call failed:', error);
      // Fall back to browser's Web Speech API
      return generateFallbackAudio(text);
    }
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

/**
 * Generates a fallback audio response that will trigger browser's native TTS
 * @param text The text to convert to speech
 */
function generateFallbackAudio(text: string) {
  // Return a special response that will tell the client to use the browser's TTS
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