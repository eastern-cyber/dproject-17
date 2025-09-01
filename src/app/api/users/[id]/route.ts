import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/database';

interface PostgresError extends Error {
  code?: string;
}

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await withDatabase(async (sql) => {
      const [result] = await sql`SELECT * FROM users WHERE id = ${params.id}`;
      return result;
    });
    
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name, email } = await request.json();
    
    const user = await withDatabase(async (sql) => {
      const [result] = await sql`
        UPDATE users 
        SET name = ${name}, email = ${email}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id}
        RETURNING *
      `;
      return result;
    });
    
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await withDatabase(async (sql) => {
      const [result] = await sql`DELETE FROM users WHERE id = ${params.id} RETURNING *`;
      return result;
    });
    
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