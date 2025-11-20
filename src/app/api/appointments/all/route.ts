import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        }
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Get user profile to check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Fetch all appointments with related data
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:client_id(id, name, email, phone),
        therapist:therapist_id(id, name, email, avatar_url),
        therapy:service_id(id, name, description)
      `)
      .order('scheduled_at', { ascending: false })

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json({ error: 'Error al cargar las citas' }, { status: 500 })
    }

    // Transform data to match the expected format
    const transformedAppointments = appointments?.map(apt => ({
      ...apt,
      client: Array.isArray(apt.client) ? apt.client[0] : apt.client,
      therapist: Array.isArray(apt.therapist) ? apt.therapist[0] : apt.therapist,
      therapy: Array.isArray(apt.therapy) ? apt.therapy[0] : apt.therapy
    })) || []

    return NextResponse.json({ 
      appointments: transformedAppointments,
      success: true 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
