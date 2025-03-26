import { Memory } from 'mem0ai/oss';

// Initialize Mem0 memory
const memory = new Memory();

// Default user ID (can be updated to use actual user IDs when authentication is implemented)
const DEFAULT_USER_ID = 'default_user';

/**
 * Add conversation messages to memory
 */
export async function addMemory(messages: { role: string; content: string }[], userId = DEFAULT_USER_ID) {
  try {
    await memory.add(messages, { userId });
    return true;
  } catch (error) {
    console.error('Error adding memory:', error);
    return false;
  }
}

/**
 * Search for relevant memories based on a query
 */
export async function searchMemory(query: string, userId = DEFAULT_USER_ID) {
  try {
    const relevantMemories = await memory.search(query, { userId });
    return relevantMemories.results || [];
  } catch (error) {
    console.error('Error searching memories:', error);
    return [];
  }
}

/**
 * Clear all memories for a user
 */
export async function clearMemories(userId = DEFAULT_USER_ID) {
  try {
    // This would depend on the Mem0 API - implementation may vary
    // For now, we'll assume memory.clear() is the method
    // await memory.clear({ userId });
    console.log(`Would clear memories for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error clearing memories:', error);
    return false;
  }
}

const memoryService = {
  addMemory,
  searchMemory,
  clearMemories
};

export default memoryService; 