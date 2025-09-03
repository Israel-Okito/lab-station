import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET(request) {
  const supabase = await createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear()
    
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    // Récupérer tous les pointages du mois avec les informations des employés
    const { data: pointages, error: pointagesError } = await supabase
      .from('pointages')
      .select(`
        *,
        employes (
          id,
          prenom,
          nom,
          statut
        )
      `)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .eq('statut_jour', 'Présent')
      .eq('employes.statut', 'Actif')

    if (pointagesError) throw pointagesError
    
    // Grouper par employé et compter les jours de présence
    const employeeAttendance = {}
    pointages?.forEach(pointage => {
      const employeeId = pointage.employe_id
      if (!employeeAttendance[employeeId]) {
        employeeAttendance[employeeId] = {
          employe_id: employeeId,
          employe: pointage.employes,
          presentDays: 0,
          totalAmount: 0
        }
      }
      employeeAttendance[employeeId].presentDays++
      employeeAttendance[employeeId].totalAmount += pointage.montant_realise || 0
    })
    
    // Trier par nombre de jours de présence (décroissant)
    const sortedEmployees = Object.values(employeeAttendance)
      .sort((a, b) => {
        // D'abord par nombre de jours de présence
        if (b.presentDays !== a.presentDays) {
          return b.presentDays - a.presentDays
        }
        // En cas d'égalité, par montant réalisé
        return b.totalAmount - a.totalAmount
      })
    
    const employeeOfTheMonth = sortedEmployees[0] || null
    
    // Calculer les statistiques globales du mois
    const totalEmployees = Object.keys(employeeAttendance).length
    const totalPresentDays = Object.values(employeeAttendance)
      .reduce((sum, emp) => sum + emp.presentDays, 0)
    const averagePresentDays = totalEmployees > 0 ? totalPresentDays / totalEmployees : 0
    
    return NextResponse.json({
      month,
      year,
      monthName: startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      employeeOfTheMonth,
      topEmployees: sortedEmployees.slice(0, 5), // Top 5 employés
      monthlyStats: {
        totalEmployees,
        totalPresentDays,
        averagePresentDays: Math.round(averagePresentDays * 100) / 100
      }
    })
  } catch (error) {
    console.error('Error fetching employee of the month:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'employé du mois' },
      { status: 500 }
    )
  }
}
