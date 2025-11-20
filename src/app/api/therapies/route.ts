import { NextRequest, NextResponse } from 'next/server'
import { TherapyService } from '@/lib/database'

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
    const body = await request.json()
    const { name, description, duration_minutes, price, category, is_active } = body

    // Validate required fields
    if (!name || !description || !duration_minutes || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const therapy = await TherapyService.createTherapy({
      name,
      description,
      duration_minutes,
      price,
      category,
      is_active: is_active !== false // Default to true
    })

    return NextResponse.json({ therapy }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating therapy:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}