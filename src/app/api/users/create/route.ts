import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/users/create - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, role, phone, bio, specialization } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      console.error('supabaseAdmin is not configured. Check SUPABASE_SERVICE_ROLE_KEY environment variable.')
      return NextResponse.json({ 
        error: 'Server configuration error: Admin client not available. Please check server logs.' 
      }, { status: 500 })
    }

    console.log('Creating user with email:', email)

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUsers?.users.some(u => u.email === email)
    
    if (userExists) {
      console.log('User already exists with email:', email)
      return NextResponse.json({ 
        error: 'Un usuario con este email ya existe' 
      }, { status: 400 })
    }

    // Create user in auth WITHOUT triggering email confirmation
    // The trigger may fail due to RLS, so we'll create the profile manually
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification for admin-created users
      user_metadata: {
        name,
        role
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      console.error('Error details:', JSON.stringify(authError, null, 2))
      return NextResponse.json({ 
        error: `Failed to create user: ${authError.message}` 
      }, { status: 500 })
    }

    if (!authData.user) {
      console.error('No user returned from createUser')
      return NextResponse.json({ error: 'No user data returned from authentication service' }, { status: 500 })
    }

    console.log('Auth user created successfully:', authData.user.id)
    console.log('User email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No')

    // Manually create profile using service role (bypasses RLS)
    // This is needed because the trigger might fail due to RLS policies
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        phone: phone || null,
        bio: bio || null,
        specialization: specialization || null,
        is_active: true
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // If profile creation fails, delete the auth user to keep things clean
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ 
        error: `Failed to create user profile: ${profileError.message}` 
      }, { status: 500 })
    }

    console.log('Profile created successfully for user:', authData.user.id)

    return NextResponse.json({ 
      success: true,
      user: {
        id: authData.user.id,
        email,
        name,
        role
      }
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
