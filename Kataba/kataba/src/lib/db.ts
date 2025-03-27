import { Pool } from 'pg';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import type { NextRequest } from 'next/server';

// Define types for database records
interface DbUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  image: string;
  created_at: Date;
  updated_at: Date;
}

interface DbSession {
  id: string;
  user_id: string;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

// Create a singleton database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Query the database with the provided SQL and parameters
 */
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Get the current user from Clerk and find or create the corresponding user in the database
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return null;
    
    const clerkUser = await clerkClient.users.getUser(userId);
    
    if (!clerkUser) {
      return null;
    }
    
    // Check if user exists in our database
    const result = await query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkUser.id]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0] as DbUser;
    }
    
    // Create the user if not exists
    const newUser = await query(
      `INSERT INTO users (
        clerk_id, 
        email, 
        name, 
        image, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [
        clerkUser.id,
        clerkUser.emailAddresses[0]?.emailAddress || '',
        clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.username || 'User',
        clerkUser.imageUrl || '',
      ]
    );
    
    return newUser.rows[0] as DbUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current user ID from the database
 */
export async function getCurrentUserId(request: NextRequest) {
  const user = await getCurrentUser(request);
  return user?.id || null;
}

/**
 * Get a user by ID from the database
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return (result.rows[0] as DbUser) || null;
}

/**
 * Get a user by Clerk ID from the database
 */
export async function getUserByClerkId(clerkId: string): Promise<DbUser | null> {
  const result = await query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
  return (result.rows[0] as DbUser) || null;
}

/**
 * Create a new session record in the database
 */
export async function createSession(userId: string, metadata: Record<string, unknown> = {}): Promise<DbSession> {
  const result = await query(
    `INSERT INTO sessions (
      user_id, 
      metadata, 
      created_at, 
      updated_at
    ) VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
    [userId, JSON.stringify(metadata)]
  );
  
  return result.rows[0] as DbSession;
}

/**
 * Associate the current Clerk session with the database ID
 * (used in API routes for authorization)
 */
export async function getAuthSession(request: NextRequest) {
  const auth = getAuth(request);
  const userId = await getCurrentUserId(request);
  
  return {
    ...auth,
    userId,
  };
} 