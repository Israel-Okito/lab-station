import {  NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns'

export async function GET(request) {
    const supabase = createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'week'
    const employeeId = searchParams.get('employeeId') || 'all'

    // Déterminer la date de début selon la période
    const now = new Date()
    let startDate
    
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        startDate = startOfMonth(now)
        break
      case 'quarter':
        startDate = startOfQuarter(now)
        break
      case 'year':
        startDate = startOfYear(now)
        break
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 })
    }

    // Construire la requête
    let query = supabase
      .from('pointages')
      .select(`
        montant_realise,
        employes (
          id,
          prenom,
          nom
        )
      `)
      .gte('date', startDate.toISOString().split('T')[0])

    if (employeeId !== 'all') {
      query = query.eq('employe_id', employeeId)
    }

    const { data: pointages, error } = await query

    if (error) throw error

    // Grouper par employé et calculer les totaux
    const employeePayments = {}

    pointages?.forEach(pointage => {
      const employeeName = `${pointage.employes?.prenom} ${pointage.employes?.nom}`
      if (!employeePayments[employeeName]) {
        employeePayments[employeeName] = {
          name: employeeName,
          amount: 0
        }
      }
      employeePayments[employeeName].amount += pointage.montant_realise
    })

    // Convertir en tableau pour le graphique
    const chartData = Object.values(employeePayments)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10) // Top 10

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching employee payments data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}