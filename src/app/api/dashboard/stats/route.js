import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    const supabase = await createClient()
  try {
    // Total des employés
    const { count: totalEmployees } = await supabase
      .from('employes')
      .select('*', { count: 'exact', head: true })

    // Employés actifs
    const { count: activeEmployees } = await supabase
      .from('employes')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'Actif')

    // Revenus d'aujourd'hui
    const today = new Date().toISOString().split('T')[0]
    const { data: todayRevenue } = await supabase
      .from('revenus')
      .select('montant_jour')
      .eq('date', today)
      .single()

    // Revenus de la semaine
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const { data: weekRevenues } = await supabase
      .from('revenus')
      .select('montant_jour')
      .gte('date', weekStart.toISOString().split('T')[0])

    const weekTotal = weekRevenues?.reduce((sum, r) => sum + r.montant_jour, 0) || 0

    return NextResponse.json({
      totalEmployees: totalEmployees || 0,
      activeEmployees: activeEmployees || 0,
      todayRevenue: todayRevenue?.montant_jour || 0,
      weekRevenue: weekTotal
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}