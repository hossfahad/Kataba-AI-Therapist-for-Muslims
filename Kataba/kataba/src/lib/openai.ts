import OpenAI from 'openai';

/**
 * Gets a completion from the chat model
 */
export async function getChatCompletion(messages: { role: 'user' | 'assistant'; content: string }[]) {
  try {
    // Call our own API endpoint that will safely use the OpenAI API server-side
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get response from API');
    }
    
    const data = await response.json();
    return data.content || '';
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw new Error('Failed to get response from AI');
  }
} 