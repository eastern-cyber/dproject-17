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
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    
    if (user_id) {
      // Get specific user by query parameter
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
    } else {
      // Get all users (for your admin dashboard)
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
      `;
      
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}