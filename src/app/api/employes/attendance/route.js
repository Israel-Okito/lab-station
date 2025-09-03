import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { startOfWeek, startOfMonth, startOfYear, format } from 'date-fns'

export async function GET(request) {
  const supabase = await createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    const period = searchParams.get('period') || 'month'
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'ID de l\'employé requis' },
        { status: 400 }
      )
    }
    
    const now = new Date()
    let startDate
    
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        startDate = startOfMonth(now)
        break
      case 'year':
        startDate = startOfYear(now)
        break
      default:
        startDate = startOfMonth(now)
    }
    
    // Récupérer les pointages de l'employé pour la période
    const { data: pointages, error: pointagesError } = await supabase
      .from('pointages')
      .select('*')
      .eq('employe_id', employeeId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .order('date')

    if (pointagesError) throw pointagesError
    
    // Récupérer les informations de l'employé
    const { data: employee, error: employeeError } = await supabase
      .from('employes')
      .select('*')
      .eq('id', employeeId)
      .single()

    if (employeeError) throw employeeError
    
    // Calculer les statistiques d'assiduité
    const totalDays = pointages?.length || 0
    const presentDays = pointages?.filter(p => p.statut_jour === 'Présent').length || 0
    const absentDays = pointages?.filter(p => p.statut_jour === 'Absent').length || 0
    const restDays = pointages?.filter(p => p.statut_jour === 'Repos').length || 0
    const totalAmount = pointages?.reduce((sum, p) => sum + (p.montant_realise || 0), 0) || 0
    const totalSalary = presentDays * (employee.salaire_jour || 0)
    
    // Calculer le taux d'assiduité
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
    
    // Grouper par semaine pour l'analyse hebdomadaire
    const weeklyStats = {}
    pointages?.forEach(pointage => {
      const weekStart = startOfWeek(new Date(pointage.date), { weekStartsOn: 1 })
      const weekKey = format(weekStart, 'yyyy-MM-dd')
      
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = {
          weekStart: weekKey,
          days: 0,
          presentDays: 0,
          absentDays: 0,
          restDays: 0,
          totalAmount: 0,
          totalSalary: 0
        }
      }
      
      weeklyStats[weekKey].days++
      if (pointage.statut_jour === 'Présent') weeklyStats[weekKey].presentDays++
      else if (pointage.statut_jour === 'Absent') weeklyStats[weekKey].absentDays++
      else if (pointage.statut_jour === 'Repos') weeklyStats[weekKey].restDays++
      
      weeklyStats[weekKey].totalAmount += pointage.montant_realise || 0
      weeklyStats[weekKey].totalSalary += (pointage.statut_jour === 'Présent' ? (employee.salaire_jour || 0) : 0)
    })
    
    return NextResponse.json({
      employee,
      period,
      startDate: format(startDate, 'yyyy-MM-dd'),
      stats: {
        totalDays,
        presentDays,
        absentDays,
        restDays,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        totalAmount,
        totalSalary
      },
      weeklyStats: Object.values(weeklyStats).sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart)),
      pointages: pointages?.sort((a, b) => new Date(a.date) - new Date(b.date)) || []
    })
  } catch (error) {
    console.error('Error fetching employee attendance:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'assiduité' },
      { status: 500 }
    )
  }
}
