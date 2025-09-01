// Minimal version for src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!sql) throw new Error('Database not configured');
    const [user] = await sql`SELECT * FROM users WHERE id = ${params.id}`;
    return NextResponse.json(user || { error: 'User not found' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}