import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    const supabase = createClient()
  try {
    const { data: employees, error } = await supabase
      .from('employes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des employés' },
      { status: 500 }
    )
  }
}