import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        category:categories(*),
        symptoms:service_symptoms(symptom:symptoms(*)),
        diseases:service_diseases(disease:diseases(*))
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service' },
      { status: 500 }
    )
  }
}
