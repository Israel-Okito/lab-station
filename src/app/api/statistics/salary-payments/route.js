import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, format, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval } from 'date-fns'

export async function GET(request) {
  const supabase = await createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    
    let startDate, endDate
    
    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr)
      endDate = new Date(endDateStr)
    } else {
      const now = new Date()
      switch (period) {
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 })
          endDate = endOfWeek(now, { weekStartsOn: 1 })
          break
        case 'month':
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          break
        case 'year':
          startDate = startOfYear(now)
          endDate = endOfYear(now)
          break
        default:
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
      }
    }
    
    // Récupérer tous les pointages payés dans la période
    const { data: pointages, error: pointagesError } = await supabase
      .from('pointages')
      .select(`
        *,
        employes (
          id,
          prenom,
          nom,
          salaire_jour
        )
      `)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .eq('paye', true)
      .order('date')

    if (pointagesError) throw pointagesError
    
    // Grouper par période selon le type demandé
    let groupedData = {}
    let periods = []
    
    switch (period) {
      case 'week':
        periods = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })
        periods.forEach(weekStart => {
          const weekKey = format(weekStart, 'yyyy-MM-dd')
          groupedData[weekKey] = {
            period: weekKey,
            label: `Semaine du ${format(weekStart, 'dd/MM')}`,
            totalSalary: 0,
            totalAmount: 0,
            employeeCount: 0,
            employees: new Set()
          }
        })
        break
        
      case 'month':
        periods = eachMonthOfInterval({ start: startDate, end: endDate })
        periods.forEach(monthStart => {
          const monthKey = format(monthStart, 'yyyy-MM')
          groupedData[monthKey] = {
            period: monthKey,
            label: format(monthStart, 'MMMM yyyy', { locale: require('date-fns/locale/fr') }),
            totalSalary: 0,
            totalAmount: 0,
            employeeCount: 0,
            employees: new Set()
          }
        })
        break
        
      case 'year':
        periods = eachYearOfInterval({ start: startDate, end: endDate })
        periods.forEach(yearStart => {
          const yearKey = yearStart.getFullYear().toString()
          groupedData[yearKey] = {
            period: yearKey,
            label: yearKey,
            totalSalary: 0,
            totalAmount: 0,
            employeeCount: 0,
            employees: new Set()
          }
        })
        break
    }
    
    // Remplir les données groupées
    pointages?.forEach(pointage => {
      let periodKey
      switch (period) {
        case 'week':
          periodKey = format(startOfWeek(new Date(pointage.date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
          break
        case 'month':
          periodKey = format(new Date(pointage.date), 'yyyy-MM')
          break
        case 'year':
          periodKey = new Date(pointage.date).getFullYear().toString()
          break
      }
      
      if (groupedData[periodKey]) {
        const salary = pointage.employes?.salaire_jour || 0
        groupedData[periodKey].totalSalary += salary
        groupedData[periodKey].totalAmount += pointage.montant_realise || 0
        groupedData[periodKey].employees.add(pointage.employe_id)
        groupedData[periodKey].employeeCount = groupedData[periodKey].employees.size
      }
    })
    
    // Convertir en tableau et trier
    const result = Object.values(groupedData)
      .map(item => ({
        ...item,
        employees: Array.from(item.employees)
      }))
      .sort((a, b) => new Date(a.period) - new Date(b.period))
    
    // Calculer les totaux globaux
    const globalStats = {
      totalSalary: result.reduce((sum, item) => sum + item.totalSalary, 0),
      totalAmount: result.reduce((sum, item) => sum + item.totalAmount, 0),
      totalEmployees: new Set(pointages?.map(p => p.employe_id) || []).size,
      averageSalaryPerPeriod: result.length > 0 ? result.reduce((sum, item) => sum + item.totalSalary, 0) / result.length : 0
    }
    
    return NextResponse.json({
      period,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      data: result,
      globalStats
    })
  } catch (error) {
    console.error('Error fetching salary payments:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques de salaires' },
      { status: 500 }
    )
  }
}
