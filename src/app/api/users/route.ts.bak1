import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  if (!sql) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const users = await sql`
      SELECT 
        id,
        user_id,
        referrer_id,
        email,
        name,
        token_id,
        created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}