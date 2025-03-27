import { Pool } from 'pg';
import { auth, currentUser } from '@clerk/nextjs';

// Create a singleton database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Query the database with the provided SQL and parameters
 */
export async function query(text: string, params?: any[]) {
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
export async function getCurrentUser() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }
  
  // Check if user exists in our database
  const result = await query(
    'SELECT * FROM users WHERE clerk_id = $1',
    [clerkUser.id]
  );
  
  if (result.rows.length > 0) {
    return result.rows[0];
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
  
  return newUser.rows[0];
}

/**
 * Get the current user ID from the database
 */
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Get a user by ID from the database
 */
export async function getUserById(id: string) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Get a user by Clerk ID from the database
 */
export async function getUserByClerkId(clerkId: string) {
  const result = await query('SELECT * FROM users WHERE clerk_id = $1', [clerkId]);
  return result.rows[0] || null;
}

/**
 * Create a new session record in the database
 */
export async function createSession(userId: string, metadata: any = {}) {
  const result = await query(
    `INSERT INTO sessions (
      user_id, 
      metadata, 
      created_at, 
      updated_at
    ) VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
    [userId, JSON.stringify(metadata)]
  );
  
  return result.rows[0];
}

/**
 * Associate the current Clerk session with the database ID
 * (used in API routes for authorization)
 */
export async function getAuthSession() {
  const session = auth();
  const userId = await getCurrentUserId();
  
  return {
    ...session,
    userId,
  };
} 