import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const therapistId = searchParams.get('therapistId')
    const date = searchParams.get('date')

    if (!therapistId || !date) {
      return NextResponse.json(
        { error: 'Missing therapistId or date' },
        { status: 400 }
      )
    }

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()

    // Get therapist availability for this day
    const { data: availability, error: availError } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true)

    if (availError) throw availError

    if (!availability || availability.length === 0) {
      return NextResponse.json({ slots: [] })
    }

    // Get existing appointments for this date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: existingAppointments, error: apptError } = await supabase
      .from('appointments')
      .select('scheduled_at, duration_minutes')
      .eq('therapist_id', therapistId)
      .in('status', ['PENDING', 'CONFIRMED'])
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())

    if (apptError) throw apptError

    // Create set of occupied time slots
    const occupiedSlots = new Set<string>()
    existingAppointments?.forEach(appointment => {
      const appointmentDate = new Date(appointment.scheduled_at)
      const timeSlot = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`
      occupiedSlots.add(timeSlot)
    })

    // Generate time slots from availability
    const slots: Array<{ date: string; time: string; available: boolean }> = []

    availability.forEach(avail => {
      const startHour = parseInt(avail.start_time.split(':')[0])
      const startMinute = parseInt(avail.start_time.split(':')[1])
      const endHour = parseInt(avail.end_time.split(':')[0])
      const endMinute = parseInt(avail.end_time.split(':')[1])

      const startMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute
      const slotDuration = 60 // 1 hour slots

      for (let time = startMinutes; time < endMinutes; time += slotDuration) {
        const hour = Math.floor(time / 60)
        const minute = time % 60
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        slots.push({
          date,
          time: timeString,
          available: !occupiedSlots.has(timeString)
        })
      }
    })

    // Sort slots by time
    slots.sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json({ slots })
  } catch (error: any) {
    console.error('Error fetching availability slots:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
