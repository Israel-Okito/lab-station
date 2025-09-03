import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { startOfWeek, endOfWeek, format } from 'date-fns'

export async function GET(request) {
  const supabase = await createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const weekStartStr = searchParams.get('weekStart')
    
    let weekStart
    if (weekStartStr) {
      weekStart = new Date(weekStartStr)
    } else {
      weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    }
    
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    // Récupérer tous les employés actifs
    const { data: employees, error: employeesError } = await supabase
      .from('employes')
      .select('*')
      .eq('statut', 'Actif')
      .order('prenom')

    if (employeesError) throw employeesError

    // Récupérer les pointages pour cette semaine
    const { data: pointages, error: pointagesError } = await supabase
      .from('pointages')
      .select('*')
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('date')

    if (pointagesError) throw pointagesError

    // Récupérer toutes les avances sur salaire de la semaine
    const { data: avances, error: avancesError } = await supabase
      .from('avances_salaires')
      .select('*')
      .gte('date_avance', format(weekStart, 'yyyy-MM-dd'))
      .lte('date_avance', format(weekEnd, 'yyyy-MM-dd'))
      .order('date_avance')

    if (avancesError) throw avancesError

    // Créer un objet pour chaque employé avec ses pointages de la semaine
    const weeklyData = employees?.map(employee => {
      const employeePointages = pointages?.filter(p => p.employe_id === employee.id) || []
      const employeeAvances = avances?.filter(a => a.employe_id === employee.id) || []
      
      // Calculer les totaux de la semaine
      const totalDays = employeePointages.length
      const presentDays = employeePointages.filter(p => p.statut_jour === 'Présent').length
      const absentDays = employeePointages.filter(p => p.statut_jour === 'Absent').length
      const restDays = employeePointages.filter(p => p.statut_jour === 'Repos').length
      const totalAmount = employeePointages.reduce((sum, p) => sum + (p.montant_realise || 0), 0)
      const totalSalary = presentDays * (employee.salaire_jour || 0)
      
      // Calculer les totaux des avances
      const totalAdvances = employeeAvances.reduce((sum, a) => sum + a.montant, 0)
      const pendingAdvances = employeeAvances.filter(a => a.statut === 'En attente').reduce((sum, a) => sum + a.montant, 0)
      const approvedAdvances = employeeAvances.filter(a => a.statut === 'Approuvée').reduce((sum, a) => sum + a.montant, 0)
      
      // Calculer le montant restant à payer
      const remainingAmount = totalSalary - totalAdvances
      
      // Vérifier si la semaine est payée
      const isWeekPaid = employeePointages.length > 0 && employeePointages.every(p => p.paye)
      
      return {
        employe: employee,
        pointages: employeePointages,
        avances: employeeAvances,
        weeklyStats: {
          totalDays,
          presentDays,
          absentDays,
          restDays,
          totalAmount,
          totalSalary,
          totalAdvances,
          pendingAdvances,
          approvedAdvances,
          remainingAmount,
          isWeekPaid
        }
      }
    }) || []

    return NextResponse.json({
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      weeklyData
    })
  } catch (error) {
    console.error('Error fetching weekly pointages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pointages hebdomadaires' },
      { status: 500 }
    )
  }
}
