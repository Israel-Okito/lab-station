import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  try {
    const { data: revenues, error } = await supabase
      .from('revenus')
      .select('*')
      .order('date', { ascending: false })
      .limit(5)

    if (error) throw error

    return NextResponse.json(revenues || [])
  } catch (error) {
    console.error('Error fetching recent revenues:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des revenus récents' },
      { status: 500 }
    )
  }
}