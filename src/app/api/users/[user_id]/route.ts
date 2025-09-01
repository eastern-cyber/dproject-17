import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// Use the correct Next.js App Router signature for dynamic routes
export async function GET(
  request: Request,
  { params }: { params: { user_id: string } }
) {
  if (!sql) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const { user_id } = params;
    
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
      WHERE user_id = ${user_id}
    `;
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}