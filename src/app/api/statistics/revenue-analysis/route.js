import { NextRequest, NextResponse } from 'next/server'
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, format } from 'date-fns'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  const supabase = createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'week'

    // Déterminer la date de début et le format selon la période
    const now = new Date()
    let startDate
    let dateFormat
    let days
    
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        dateFormat = 'dd/MM'
        days = 7
        break
      case 'month':
        startDate = startOfMonth(now)
        dateFormat = 'dd/MM'
        days = 30
        break
      case 'quarter':
        startDate = startOfQuarter(now)
        dateFormat = 'MMM yyyy'
        days = 90
        break
      case 'year':
        startDate = startOfYear(now)
        dateFormat = 'MMM yyyy'
        days = 365
        break
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        dateFormat = 'dd/MM'
        days = 7
    }

    // Récupérer les revenus
    const { data: revenues, error: revenuesError } = await supabase
      .from('revenus')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date')

    if (revenuesError) throw revenuesError

    // Récupérer les paiements aux employés
    const { data: pointages, error: pointagesError } = await supabase
      .from('pointages')
      .select('date, montant_realise')
      .gte('date', startDate.toISOString().split('T')[0])

    if (pointagesError) throw pointagesError

    // Créer un objet pour grouper par période
    const periodData = {}

    // Traiter les revenus
    revenues?.forEach(revenue => {
      const periodKey = format(new Date(revenue.date), dateFormat)
      if (!periodData[periodKey]) {
        periodData[periodKey] = { revenue: 0, payments: 0 }
      }
      periodData[periodKey].revenue += revenue.montant_jour
    })

    // Traiter les paiements
    pointages?.forEach(pointage => {
      const periodKey = format(new Date(pointage.date), dateFormat)
      if (!periodData[periodKey]) {
        periodData[periodKey] = { revenue: 0, payments: 0 }
      }
      periodData[periodKey].payments += pointage.montant_realise
    })

    // Convertir en tableau pour le graphique
    const chartData = Object.entries(periodData).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      payments: data.payments
    }))

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching revenue analysis data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}