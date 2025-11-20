import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET - Load therapist's current services
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const therapistId = searchParams.get('therapistId')

    if (!therapistId) {
      return NextResponse.json(
        { error: 'Missing therapistId' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get therapist's services
    const { data, error } = await supabase
      .from('therapist_services')
      .select('service_id, price')
      .eq('therapist_id', therapistId)

    if (error) throw error

    return NextResponse.json({ services: data || [] })
  } catch (error: any) {
    console.error('Error fetching therapist services:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST - Save therapist's services
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
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { therapistId, services } = body

    if (!therapistId || !services) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is the therapist or admin
    if (user.id !== therapistId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Delete existing services
    await supabase
      .from('therapist_services')
      .delete()
      .eq('therapist_id', therapistId)

    // Insert new services
    if (services.length > 0) {
      const servicesToInsert = services.map((service: any) => ({
        therapist_id: therapistId,
        service_id: service.service_id,
        price: service.price
      }))

      const { error: insertError } = await supabase
        .from('therapist_services')
        .insert(servicesToInsert)

      if (insertError) throw insertError
    }

    return NextResponse.json({
      success: true,
      message: 'Services updated successfully'
    })
  } catch (error: any) {
    console.error('Error saving therapist services:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save services' },
      { status: 500 }
    )
  }
}
