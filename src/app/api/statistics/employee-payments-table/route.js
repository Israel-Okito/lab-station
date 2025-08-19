import {  NextResponse } from 'next/server'
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
    const supabase =  await createClient()
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
        date,
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

    // Grouper par employé et calculer les statistiques
    const employeeStats = {}

    pointages?.forEach(pointage => {
      const employeeName = `${pointage.employes?.prenom} ${pointage.employes?.nom}`
      if (!employeeStats[employeeName]) {
        employeeStats[employeeName] = {
          name: employeeName,
          total: 0,
          days: new Set()
        }
      }
      employeeStats[employeeName].total += pointage.montant_realise
      employeeStats[employeeName].days.add(pointage.date)
    })

    // Convertir en tableau avec moyennes
    const tableData = Object.values(employeeStats).map(employee => ({
      name: employee.name,
      total: employee.total,
      days: employee.days.size,
      average: employee.days.size > 0 ? employee.total / employee.days.size : 0
    })).sort((a, b) => b.total - a.total)

    const totalPaid = tableData.reduce((sum, employee) => sum + employee.total, 0)

    return NextResponse.json({
      data: tableData,
      total: totalPaid
    })
  } catch (error) {
    console.error('Error fetching employee payments table data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}