/**
 * Gets a completion from the chat model
 */
export async function getChatCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[], 
  conversationId?: string | null
) {
  try {
    console.log("Sending chat request to API endpoint");
    
    // Call our own API endpoint that will safely use the OpenAI API server-side
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages,
        conversationId 
      }),
    });
    
    // Log response status
    console.log(`API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response from API:", {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.content || '';
  } catch (error) {
    console.error('Detailed error getting chat completion:', error);
    if (error instanceof Error) {
      console.error({
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw new Error('Failed to get response from AI');
  }
} 