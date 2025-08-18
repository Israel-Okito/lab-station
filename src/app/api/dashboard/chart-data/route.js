import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'


export async function GET() {
    const supabase = createClient()
  try {
    // Obtenir les 7 derniers jours
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const chartData = []

    for (const date of dates) {
      // Revenus du jour
      const { data: revenue } = await supabase
        .from('revenus')
        .select('montant_jour')
        .eq('date', date)
        .single()

      // Total des paiements aux employés du jour
      const { data: pointages } = await supabase
        .from('pointages')
        .select('montant_realise')
        .eq('date', date)

      const totalPaiements = pointages?.reduce((sum, p) => sum + p.montant_realise, 0) || 0

      chartData.push({
        date,
        revenus: revenue?.montant_jour || 0,
        paiements: totalPaiements
      })
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données graphiques' },
      { status: 500 }
    )
  }
}