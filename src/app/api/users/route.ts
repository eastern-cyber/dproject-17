import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/database';

// Define proper error interface
interface PostgresError extends Error {
  code?: string;
}

export async function GET() {
  try {
    const users = await withDatabase(async (sql) => {
      return await sql`SELECT * FROM users ORDER BY created_at DESC`;
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const user = await withDatabase(async (sql) => {
      const [result] = await sql`
        INSERT INTO users (name, email) 
        VALUES (${name}, ${email})
        RETURNING *
      `;
      return result;
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    const pgError = error as PostgresError;
    if (pgError.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user', details: pgError.message },
      { status: 500 }
    );
  }
}