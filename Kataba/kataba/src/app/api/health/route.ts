import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check if key services are available
    // For now, we'll just return success
    // In a more complex implementation, we might check connections to critical services
    
    return NextResponse.json(
      { 
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          chat: true
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Service health check failed',
        timestamp: new Date().toISOString() 
      }, 
      { status: 500 }
    );
  }
} 