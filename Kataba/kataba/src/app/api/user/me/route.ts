import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getUserByClerkId } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    
    // If not authenticated, return 401
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user from the database
    const user = await getUserByClerkId(userId);
    
    // If user is not found in the database, return 404
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return the user data
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 