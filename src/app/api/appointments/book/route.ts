import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
    const {
      therapist_id,
      service_id,
      scheduled_at,
      duration_minutes,
      price,
      notes
    } = body

    // Validate required fields
    if (!therapist_id || !service_id || !scheduled_at || !duration_minutes || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slot is still available
    const scheduledDate = new Date(scheduled_at)
    const { data: existingAppointments, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', therapist_id)
      .eq('scheduled_at', scheduledDate.toISOString())
      .in('status', ['PENDING', 'CONFIRMED'])

    if (checkError) throw checkError

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible' },
        { status: 409 }
      )
    }

    // Create appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        client_id: user.id,
        therapist_id,
        service_id,
        scheduled_at: scheduledDate.toISOString(),
        duration_minutes,
        status: 'PENDING',
        price,
        notes
      })
      .select()
      .single()

    if (createError) throw createError

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        appointment_id: appointment.id,
        amount: price,
        status: 'PENDING',
        payment_method: null
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Send notification to therapist
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: therapist_id,
        title: 'Nueva Cita Pendiente',
        message: `Tienes una nueva solicitud de cita para ${scheduledDate.toLocaleDateString('es-ES')} a las ${scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
        type: 'appointment_request',
        data: {
          appointment_id: appointment.id,
          client_id: user.id,
          scheduled_at
        }
      })

    if (notifError) console.error('Error creating notification:', notifError)

    // In a real implementation, integrate with Stripe or another payment provider
    // For now, we'll simulate payment processing
    
    // Simulate payment URL (replace with actual Stripe checkout URL)
    // const paymentUrl = `https://checkout.stripe.com/pay/${payment.id}`

    // In a real implementation with Stripe, you would return the checkout URL
    // For now, return success and let the frontend redirect
    return NextResponse.json({
      success: true,
      appointment,
      payment,
      redirectUrl: '/booking-success?success=true',
      // paymentUrl // Uncomment when Stripe is integrated
      message: 'Cita creada exitosamente. Por favor, confirma con el terapeuta.'
    })
  } catch (error: any) {
    console.error('Error booking appointment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to book appointment' },
      { status: 500 }
    )
  }
}
