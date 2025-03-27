import { createClerkClient } from '@clerk/clerk-sdk-node';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Clerk client
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

async function syncClerkUsers() {
  try {
    console.log('Starting Clerk user synchronization...');
    
    // Get all users from Clerk
    const clerkUsers = await clerk.users.getUserList({
      limit: 100, // Adjust as needed
    });
    
    console.log(`Found ${clerkUsers.length} users in Clerk`);
    
    // Process each user
    for (const clerkUser of clerkUsers) {
      const clerkId = clerkUser.id;
      const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const name = `${firstName} ${lastName}`.trim() || 'User';
      const imageUrl = clerkUser.imageUrl || '';
      
      // Check if user exists in database
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE clerk_id = $1',
        [clerkId]
      );
      
      if (existingUser.rows.length === 0) {
        // Insert new user
        await pool.query(
          `INSERT INTO users (
            clerk_id, 
            email, 
            name, 
            image, 
            created_at, 
            updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [clerkId, primaryEmail, name, imageUrl]
        );
        console.log(`Created user in database: ${clerkId} (${name})`);
      } else {
        // Update existing user
        await pool.query(
          `UPDATE users SET 
            email = $1, 
            name = $2, 
            image = $3, 
            updated_at = NOW() 
          WHERE clerk_id = $4`,
          [primaryEmail, name, imageUrl, clerkId]
        );
        console.log(`Updated user in database: ${clerkId} (${name})`);
      }
    }
    
    console.log('Clerk user synchronization complete!');
  } catch (error) {
    console.error('Error synchronizing users:', error);
  } finally {
    // Close the database pool
    await pool.end();
  }
}

// Run the synchronization
syncClerkUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 