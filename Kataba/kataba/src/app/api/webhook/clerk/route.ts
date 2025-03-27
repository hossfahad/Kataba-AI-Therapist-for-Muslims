import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { Pool } from 'pg';

// Initialize the database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Type definitions for Clerk webhook events
type WebhookEvent = {
  data: {
    id: string;
    email_addresses: {
      email_address: string;
      verification: { status: string };
      id: string;
    }[];
    first_name: string;
    last_name: string;
    image_url: string;
    created_at: number;
    updated_at: number;
  };
  object: string;
  type: string;
};

export async function POST(req: Request) {
  // Get the headers from the request directly
  const svix_id = req.headers.get('svix-id') || '';
  const svix_timestamp = req.headers.get('svix-timestamp') || '';
  const svix_signature = req.headers.get('svix-signature') || '';

  // If there are no svix headers, this isn't a webhook event
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Not a valid Svix request', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with the webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';
  const wh = new Webhook(webhookSecret);

  let event: WebhookEvent;

  // Verify the webhook payload
  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Invalid signature', {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = event.type;
  console.log(`Webhook received: ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url, created_at } = event.data;
    
    // Get the primary email
    const primaryEmail = email_addresses[0]?.email_address || '';
    
    // Get the user's name
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';
    
    try {
      // Check if user already exists in our database
      const existingUserResult = await pool.query(
        'SELECT * FROM users WHERE clerk_id = $1',
        [clerkId]
      );

      if (existingUserResult.rows.length === 0) {
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
          [clerkId, primaryEmail, name, image_url]
        );
        console.log(`User created in database: ${clerkId}`);
      } else {
        // Update existing user
        await pool.query(
          `UPDATE users SET 
            email = $1, 
            name = $2, 
            image = $3, 
            updated_at = NOW() 
          WHERE clerk_id = $4`,
          [primaryEmail, name, image_url, clerkId]
        );
        console.log(`User updated in database: ${clerkId}`);
      }
      
      return NextResponse.json({ success: true, message: 'User synced with database' });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: 'Database error' },
        { status: 500 }
      );
    }
  }

  // Return a 200 response for all other event types
  return NextResponse.json({ success: true, message: 'Webhook received' });
} 