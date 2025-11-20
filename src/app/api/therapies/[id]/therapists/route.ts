import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get therapists who offer this service
    const { data: therapistServices, error: tsError } = await supabase
      .from('therapist_services')
      .select('therapist_id, price')
      .eq('service_id', id)

    if (tsError) throw tsError

    if (!therapistServices || therapistServices.length === 0) {
      return NextResponse.json({ therapists: [] })
    }

    const therapistIds = therapistServices.map(ts => ts.therapist_id)

    // Get therapist profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, bio, avatar_url, phone')
      .in('id', therapistIds)
      .eq('role', 'THERAPIST')

    if (profilesError) throw profilesError

    // Get ratings for therapists
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('therapist_id, rating')
      .in('therapist_id', therapistIds)

    if (reviewsError) console.error('Error fetching reviews:', reviewsError)

    // Calculate average ratings
    const ratingsMap = new Map<string, { sum: number; count: number }>()
    reviews?.forEach(review => {
      const current = ratingsMap.get(review.therapist_id) || { sum: 0, count: 0 }
      ratingsMap.set(review.therapist_id, {
        sum: current.sum + review.rating,
        count: current.count + 1
      })
    })

    // Combine data
    const therapists = profiles?.map(profile => {
      const ratingData = ratingsMap.get(profile.id)
      return {
        ...profile,
        rating: ratingData ? Math.round((ratingData.sum / ratingData.count) * 10) / 10 : undefined,
        reviews_count: ratingData?.count || 0
      }
    })

    return NextResponse.json({ therapists })
  } catch (error: any) {
    console.error('Error fetching therapists:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch therapists' },
      { status: 500 }
    )
  }
}
