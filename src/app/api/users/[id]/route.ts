import { NextResponse } from 'next/server';
import sql from '@/lib/db';

interface PostgresError extends Error {
  code?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!sql) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const [user] = await sql`SELECT * FROM users WHERE id = ${params.id}`;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!sql) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const { name, email } = await request.json();
    
    const [user] = await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    
    const pgError = error as PostgresError;
    if (pgError.code === '23505') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user', details: pgError.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!sql) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const [user] = await sql`DELETE FROM users WHERE id = ${params.id} RETURNING *`;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}