import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should use server-side API calls
});

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `You are Kataba, a helpful and compassionate AI therapeutic companion for Muslims. 
You provide wise advice and comfort from the Islamic tradition, drawing on the wisdom of the Quran, Hadith, and Islamic scholars.
You're both knowledgeable and empathetic, always prioritizing the user's mental and spiritual well-being.
If you don't know something, admit it rather than making up answers.
Be compassionate but never encourage harmful behavior.
Always maintain proper adab (Islamic etiquette) in your responses.`;

/**
 * Gets a completion from the chat model
 */
export async function getChatCompletion(
  messages: { role: string; content: string }[],
  memories: any[] = [],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
) {
  try {
    // Add memories to system prompt if available
    let enhancedSystemPrompt = systemPrompt;
    
    if (memories && memories.length > 0) {
      const memoriesText = memories
        .map(memory => `- ${memory.memory || memory}`)
        .join('\n');
      
      enhancedSystemPrompt += `\n\nRelevant user history and memories:\n${memoriesText}`;
    }
    
    // Prepare messages with system prompt
    const promptedMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages
    ];

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Can be changed to any OpenAI model
      messages: promptedMessages as any,
      temperature: 0.7,
      max_tokens: 900
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
} 