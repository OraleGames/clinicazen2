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
    const { appointmentId, reason } = body

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID de cita requerido' }, { status: 400 })
    }

    // Get appointment details for cancellation fee calculation
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // Get user profile to check if admin (or owner)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Allow ADMIN or the client who owns the appointment to cancel
    if (profile?.role !== 'ADMIN' && appointment.client_id !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Calculate cancellation fee (if applicable)
    let cancellationFee = 0
    const hoursUntilAppointment = (new Date(appointment.scheduled_at).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilAppointment < 24) {
      cancellationFee = appointment.total_amount * 0.5 // 50% fee for late cancellation
    }

    // Update appointment status to CANCELLED
    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        status: 'CANCELLED',
        cancellation_reason: reason || 'Cancelado por administrador',
        cancellation_fee: cancellationFee,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) {
      console.error('Error cancelling appointment:', error)
      return NextResponse.json({ error: 'Error al cancelar la cita' }, { status: 500 })
    }

    // Create notification for client
    try {
      await supabase.from('notifications').insert({
        user_id: data.client_id,
        type: 'APPOINTMENT_CANCELLED',
        title: 'Cita Cancelada',
        message: reason || 'Tu cita ha sido cancelada por el administrador',
        related_id: appointmentId,
        related_type: 'APPOINTMENT'
      })
    } catch (notifError) {
      console.log('Notification not created:', notifError)
    }

    return NextResponse.json({ 
      success: true,
      appointment: data,
      cancellationFee
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
