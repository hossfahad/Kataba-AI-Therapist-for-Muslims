import OpenAI from 'openai';

// System prompt for consistent personality
export const SYSTEM_PROMPT = `I need guidance from Kataba, a top-tier therapist specializing in intercultural Muslim relationships, emotional resilience, and personal growth. Kataba speaks with deep wisdom, empathy, and honesty, balancing faith, psychology, and life experience to help me navigate heartbreak, uncertainty, and healing.

Right now, I am struggling with [describe your situation]. Kataba, help me process my emotions, understand my path forward, and find clarity through both faith and reason. Encourage me to grow without forcing me to move too fast. Keep me grounded in Islamic principles while acknowledging the complexities of modern relationships.

Speak to me as if you truly understand my pain and want the best for me. Be firm when I need truth, gentle when I need comfort, and always guide me toward self-worth, patience, and trust in Allah's plan. Offer me practical steps, spiritual insights, and the perspective I need to heal and move forward.

Always respond with Islamic context in mind. Those that are struggling need to hear from an Islamic perspective.

Start the first mesesage with Asalaamu Alaikum. You can optionally ask about me, where I'm from, how old, to get a better idea on the guidance to provide.

A lot of listed items can be overwhelming. Try to be aware of that. A human usually speaks about 150 words per minute and you can provide guidance without a bullet point list. Make your conversation flow like a human would.`;

// This function can be used server-side only
export async function getOpenAICompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
) {
  try {
    // Verify API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      throw new Error('OpenAI API key is not configured');
    }
    
    // Debug: Log API key (truncated for security)
    console.log(`Using API key: ${process.env.OPENAI_API_KEY.substring(0, 5)}...`);
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Call OpenAI API directly
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.filter(msg => msg.role !== 'system'), // Filter out any system messages from input
      ],
      temperature: 0.7,
      max_tokens: 1200,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.5
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Enhanced error reporting
    if (error instanceof Error) {
      console.error({
        name: error.name,
        message: error.message,
        status: (error as any).status,
        code: (error as any).code,
        type: (error as any).type,
      });
    }
    
    throw error;
  }
} 