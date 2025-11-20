import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/testimonials?therapy_id=123
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const therapy_id = searchParams.get('therapy_id')

    if (!therapy_id) {
      return NextResponse.json(
        { error: 'therapy_id is required' },
        { status: 400 }
      )
    }

    // Get approved testimonials for the therapy
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select(`
        id,
        author_name,
        rating,
        comment,
        created_at,
        user:profiles(
          avatar_url
        )
      `)
      .eq('therapy_id', therapy_id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format testimonials
    const formattedTestimonials = testimonials.map(t => ({
      id: t.id,
      author: t.author_name,
      avatar: Array.isArray(t.user) && t.user[0] ? t.user[0].avatar_url : null,
      rating: t.rating,
      comment: t.comment,
      date: t.created_at
    }))

    return NextResponse.json({ testimonials: formattedTestimonials })
  } catch (error: any) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { error: error.message || 'Error fetching testimonials' },
      { status: 500 }
    )
  }
}

// POST /api/testimonials
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { therapy_id, rating, comment } = body

    if (!therapy_id || !rating || !comment) {
      return NextResponse.json(
        { error: 'therapy_id, rating, and comment are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', session.user.id)
      .single()

    // Create testimonial
    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        therapy_id,
        user_id: session.user.id,
        author_name: profile?.name || 'Usuario',
        rating,
        comment,
        is_approved: false // Requires admin approval
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      testimonial,
      message: 'Testimonio enviado. Será publicado después de revisión.'
    })
  } catch (error: any) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { error: error.message || 'Error creating testimonial' },
      { status: 500 }
    )
  }
}
