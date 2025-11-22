import { NextRequest, NextResponse } from 'next/server'
import { TherapyService } from '@/lib/database'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper to check admin access
async function checkAdminAccess() {
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
    throw new Error('Unauthorized')
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }

  return session
}

export const dynamic = 'force-dynamic'

// GET /api/therapies - Get all active therapies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') !== 'false' // Default to true

    const therapies = active
      ? await TherapyService.getActiveTherapies()
      : await TherapyService.getAllTherapies()

    return NextResponse.json({ therapies })
  } catch (error: any) {
    console.error('Error fetching therapies:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/therapies - Create new therapy (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    await checkAdminAccess()

    const body = await request.json()
    const {
      name,
      description,
      extended_description,
      full_description,
      duration_minutes,
      price,
      category_id,
      category,
      image_url,
      image2_url,
      image3_url,
      back_image_url,
      slug,
      symptoms,
      diseases,
      is_active
    } = body

    // Validate required fields
    if (!name || !description || !duration_minutes || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const therapy = await TherapyService.createTherapy({
      name,
      description,
      extended_description,
      full_description,
      duration_minutes,
      price,
      category_id,
      category,
      image_url,
      image2_url,
      image3_url,
      back_image_url,
      slug,
      symptoms,
      diseases,
      is_active: is_active !== false // Default to true
    })

    return NextResponse.json({ therapy }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating therapy:', error)
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/therapies - Update therapy (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check admin access
    await checkAdminAccess()

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const therapy = await TherapyService.updateTherapy(id, updates)

    return NextResponse.json({ therapy })
  } catch (error: any) {
    console.error('Error updating therapy:', error)
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/therapies - Delete therapy (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin access
    await checkAdminAccess()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    await TherapyService.deleteTherapy(parseInt(id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting therapy:', error)
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
