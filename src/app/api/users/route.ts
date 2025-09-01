import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const users = await sql`
      SELECT * FROM users 
      ORDER BY created_at DESC
    `
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const [user] = await sql`
      INSERT INTO users (name, email) 
      VALUES (${name}, ${email})
      RETURNING *
    `
    
    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}