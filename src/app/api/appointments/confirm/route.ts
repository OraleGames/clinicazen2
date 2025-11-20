import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getServerSession } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID de cita requerido' }, { status: 400 })
    }

    // Get appointment details
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Allow ADMIN or the therapist assigned to the appointment to confirm
    if (profile?.role !== 'ADMIN' && appointment.therapist_id !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Update appointment status to CONFIRMED
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'CONFIRMED',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) {
      console.error('Error confirming appointment:', error)
      return NextResponse.json({ error: 'Error al confirmar la cita' }, { status: 500 })
    }

    // Create notification for client (if notifications table exists)
    try {
      await supabase.from('notifications').insert({
        user_id: data.client_id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Cita Confirmada',
        message: 'Tu cita ha sido confirmada por el administrador',
        related_id: appointmentId,
        related_type: 'APPOINTMENT'
      })
    } catch (notifError) {
      console.log('Notification not created:', notifError)
    }

    return NextResponse.json({ 
      success: true,
      appointment: data
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
