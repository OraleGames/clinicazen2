import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/auth/reset-password - Send password reset email
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()
    
    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 })
    }

    // Generate password reset token
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    
    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json({ error: 'Error sending password reset email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}