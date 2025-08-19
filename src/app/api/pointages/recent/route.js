import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  try {
    const { data: pointages, error } = await supabase
      .from('pointages')
      .select(`
        *,
        employes (
          prenom,
          nom
        )
      `)
      .order('date', { ascending: false })
      .limit(10)

    if (error) throw error

    // Ajouter les noms des employés dans le pointage
    const formattedPointages = pointages?.map(pointage => ({
      ...pointage,
      employe_prenom: pointage.employes?.prenom,
      employe_nom: pointage.employes?.nom
    })) || []

    return NextResponse.json(formattedPointages)
  } catch (error) {
    console.error('Error fetching recent pointages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pointages récents' },
      { status: 500 }
    )
  }
}