import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export async function GET() {
  try {
    const isHealthy = await checkDatabaseHealth();
    
    return NextResponse.json({ 
      status: isHealthy ? 'healthy' : 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: isHealthy ? 'connected' : 'disconnected',
      message: isHealthy ? 'Database connection successful' : 'Database connection failed or not configured'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        database: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}