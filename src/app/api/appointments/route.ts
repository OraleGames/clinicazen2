import { NextRequest, NextResponse } from 'next/server'
import { AppointmentService, TherapyService, UserService, AvailabilityService } from '@/lib/database'
import { createServerSupabaseClient, getServerSession } from '@/lib/supabase-server'

// GET /api/appointments - Get appointments for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as 'CLIENT' | 'THERAPIST'
    
    if (!role) {
      return NextResponse.json({ error: 'Role parameter is required' }, { status: 400 })
    }

    const appointments = await AppointmentService.getUserAppointments(session.user.id, role)
    
    return NextResponse.json({ appointments })
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { therapistId, therapyId, date, startTime, endTime, notes } = body

    // Validate required fields
    if (!therapistId || !therapyId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get therapy details
    const therapy = await TherapyService.getTherapyById(therapyId)
    if (!therapy) {
      return NextResponse.json({ error: 'Therapy not found' }, { status: 404 })
    }

    // Check if therapist is available at that time
    const availability = await AvailabilityService.getSpecificAvailability(therapistId, date)
    const isAvailable = availability.some(slot => 
      slot.start_time <= startTime && slot.end_time >= endTime
    )

    if (!isAvailable) {
      return NextResponse.json({ error: 'Therapist not available at selected time' }, { status: 400 })
    }

    // Create appointment
    const appointment = await AppointmentService.createAppointment({
      client_id: session.user.id,
      therapist_id: therapistId,
      service_id: therapyId,
      scheduled_at: new Date(`${date}T${startTime}`).toISOString(),
      duration_minutes: therapy.duration_minutes,
      status: 'PENDING',
      price: therapy.price,
      payment_status: 'PENDING',
      total_amount: therapy.price,
      notes: notes || '',
      cancellation_fee: 0,
      cancellation_deadline_hours: 5
    })

    // Create notification for therapist
    const supabase = await createServerSupabaseClient()
    await supabase
      .from('notifications')
      .insert({
        user_id: therapistId,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Nueva Cita Programada',
        message: `Tienes una nueva cita programada para ${date} a las ${startTime}`,
        is_read: false,
        email_sent: false
      })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}