import { NextRequest, NextResponse } from 'next/server'
import { AvailabilityService } from '@/lib/database'
import { supabase } from '@/lib/supabase'

// GET /api/availability - Get therapist availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const therapistId = searchParams.get('therapistId')
    const date = searchParams.get('date')

    if (!therapistId) {
      return NextResponse.json({ error: 'therapistId parameter is required' }, { status: 400 })
    }

    let availability
    if (date) {
      // Get specific date availability
      availability = await AvailabilityService.getSpecificAvailability(therapistId, date)
    } else {
      // Get recurring availability
      availability = await AvailabilityService.getTherapistAvailability(therapistId)
    }
    
    return NextResponse.json({ availability })
  } catch (error: any) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/availability - Set therapist availability
export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Support both single slot and bulk slots format
    if (body.slots && Array.isArray(body.slots)) {
      // Bulk update format: { therapistId, slots: [{day_of_week, start_time, end_time, is_available}] }
      const { therapistId, slots } = body

      if (!therapistId) {
        return NextResponse.json({ error: 'therapistId required' }, { status: 400 })
      }

      // Check if user is therapist or admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const isAdmin = profile?.role === 'ADMIN'
      const isSelf = session.user.id === therapistId

      if (!isAdmin && !isSelf) {
        return NextResponse.json({ error: 'Can only set your own availability' }, { status: 403 })
      }

      // Delete existing slots for this therapist
      await supabase
        .from('therapist_availability')
        .delete()
        .eq('therapist_id', therapistId)

      // Insert new slots
      if (slots.length > 0) {
        const { data: newSlots, error } = await supabase
          .from('therapist_availability')
          .insert(slots)
          .select()

        if (error) {
          console.error('Error saving availability:', error)
          return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 })
        }

        return NextResponse.json({ slots: newSlots })
      }

      return NextResponse.json({ slots: [] })
    }

    // Original single slot format
    const { therapistId, date, startTime, endTime, isAvailable, notes } = body

    // Validate required fields
    if (!therapistId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user is therapist or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const isAdmin = profile?.role === 'ADMIN'
    const isSelf = session.user.id === therapistId

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Can only set your own availability' }, { status: 403 })
    }

    const availability = await AvailabilityService.setAvailability({
      therapist_id: therapistId,
      date,
      start_time: startTime,
      end_time: endTime,
      is_available: isAvailable !== false,
      notes: notes || ''
    })

    return NextResponse.json({ availability }, { status: 201 })
  } catch (error: any) {
    console.error('Error setting availability:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/availability - Remove therapist availability
export async function DELETE(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const therapistId = searchParams.get('therapistId')
    const date = searchParams.get('date')
    const startTime = searchParams.get('startTime')

    if (!therapistId || !date || !startTime) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Check if user is therapist or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const isAdmin = profile?.role === 'ADMIN'
    const isSelf = session.user.id === therapistId

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Can only remove your own availability' }, { status: 403 })
    }

    await AvailabilityService.removeAvailability(therapistId, date, startTime)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing availability:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}