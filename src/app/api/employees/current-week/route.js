import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { startOfWeek, endOfWeek, format } from 'date-fns'

export async function GET(request) {
  const supabase = await createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employeeId')
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'ID de l\'employé requis' },
        { status: 400 }
      )
    }

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    // Récupérer l'employé
    const { data: employee, error: employeeError } = await supabase
      .from('employes')
      .select('*')
      .eq('id', employeeId)
      .single()

    if (employeeError) throw employeeError

    // Récupérer les pointages de la semaine
    const { data: pointages, error: pointagesError } = await supabase
      .from('pointages')
      .select('*')
      .eq('employe_id', employeeId)
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (pointagesError) throw pointagesError

    // Récupérer les avances de la semaine
    const { data: avances, error: avancesError } = await supabase
      .from('avances_salaires')
      .select('*')
      .eq('employe_id', employeeId)
      .gte('date_avance', format(weekStart, 'yyyy-MM-dd'))
      .lte('date_avance', format(weekEnd, 'yyyy-MM-dd'))
      .order('date_avance', { ascending: true })

    if (avancesError) throw avancesError

    // Calculer les totaux de la semaine
    const totalDays = pointages?.length || 0
    const presentDays = pointages?.filter(p => p.statut_jour === 'Présent').length || 0
    const absentDays = pointages?.filter(p => p.statut_jour === 'Absent').length || 0
    const restDays = pointages?.filter(p => p.statut_jour === 'Repos').length || 0
    const totalAmount = pointages?.reduce((sum, p) => sum + (p.montant_realise || 0), 0) || 0
    const totalSalary = presentDays * (employee.salaire_jour || 0)
    
    // Calculer les totaux des avances (seulement approuvées et payées)
    const totalAdvances = avances
      ?.filter(a => a.statut === 'Approuvée' || a.statut === 'Payée')
      .reduce((sum, a) => sum + a.montant, 0) || 0
    
    // Calculer le montant restant à payer (Montant réalisé - Total avances)
    const remainingAmount = totalAmount - totalAdvances
    
    return NextResponse.json({
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      employee,
      pointages: pointages || [],
      avances: avances || [],
      weeklyStats: {
        totalDays,
        presentDays,
        absentDays,
        restDays,
        totalAmount,
        totalSalary,
        totalAdvances,
        remainingAmount
      }
    })
  } catch (error) {
    console.error('Error fetching employee current week data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données de la semaine' },
      { status: 500 }
    )
  }
}
