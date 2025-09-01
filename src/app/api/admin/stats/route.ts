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
    const totalUsers = await sql`SELECT COUNT(*) FROM users`;
    const todayUsers = await sql`
      SELECT COUNT(*) FROM users 
      WHERE created_at::date = CURRENT_DATE
    `;
    const yesterdayUsers = await sql`
      SELECT COUNT(*) FROM users 
      WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'
    `;

    return NextResponse.json({
      total: parseInt(totalUsers[0].count),
      today: parseInt(todayUsers[0].count),
      yesterday: parseInt(yesterdayUsers[0].count),
      newUsers: parseInt(todayUsers[0].count) - parseInt(yesterdayUsers[0].count)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}