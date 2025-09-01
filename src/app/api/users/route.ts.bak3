import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
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

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const [user] = await sql`
      INSERT INTO users (name, email) 
      VALUES (${name}, ${email})
      RETURNING *
    `;
    
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}