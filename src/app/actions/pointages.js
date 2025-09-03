'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { startOfWeek, endOfWeek, format, addWeeks, isSameWeek } from 'date-fns'

export async function savePointage(data) {
  const supabase = await createClient()
  try {
    const { data: pointage, error } = await supabase
      .from('pointages')
      .upsert([data], { 
        onConflict: 'employe_id,date',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/pointage')
    return { success: true, data: pointage }
  } catch (error) {
    console.error('Error saving pointage:', error)
    return { success: false, error: 'Erreur lors de la sauvegarde du pointage' }
  }
}

export async function getWeeklyPointages(weekStart) {
  const supabase = await createClient()
  try {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    const { data: pointages, error } = await supabase
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
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('date')

    if (error) throw error

    // Grouper par employé et calculer les totaux
    const weeklyTotals = {}
    pointages?.forEach(pointage => {
      const employeeId = pointage.employe_id
      if (!weeklyTotals[employeeId]) {
        weeklyTotals[employeeId] = {
          employe_id: employeeId,
          employe: pointage.employes,
          total_days: 0,
          total_amount: 0,
          total_salary: 0,
          days: []
        }
      }
      
      weeklyTotals[employeeId].total_days++
      weeklyTotals[employeeId].total_amount += pointage.montant_realise || 0
      weeklyTotals[employeeId].total_salary += pointage.employes?.salaire_jour || 0
      weeklyTotals[employeeId].days.push(pointage)
    })

    return { success: true, data: Object.values(weeklyTotals) }
  } catch (error) {
    console.error('Error fetching weekly pointages:', error)
    return { success: false, error: 'Erreur lors de la récupération des pointages hebdomadaires' }
  }
}

export async function markWeekAsPaid(weekStart, employeeIds) {
  const supabase = await createClient()
  try {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    
    // Marquer tous les pointages de la semaine comme payés
    const { error } = await supabase
      .from('pointages')
      .update({ paye: true, date_paiement: new Date().toISOString() })
      .in('employe_id', employeeIds)
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))

    if (error) throw error

    revalidatePath('/pointage')
    return { success: true }
  } catch (error) {
    console.error('Error marking week as paid:', error)
    return { success: false, error: 'Erreur lors du marquage de la semaine comme payée' }
  }
}

export async function getCurrentWeek() {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  return weekStart
}

export async function getNextWeek(currentWeekStart) {
  return addWeeks(currentWeekStart, 1)
}

export async function getEmployeeAttendance(employeeId, period = 'month') {
  const supabase = await createClient()
  try {
    const now = new Date()
    let startDate
    
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 })
    }

    const { data: pointages, error } = await supabase
      .from('pointages')
      .select('*')
      .eq('employe_id', employeeId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .order('date')

    if (error) throw error

    // Calculer les statistiques d'assiduité
    const totalDays = pointages?.length || 0
    const presentDays = pointages?.filter(p => p.statut_jour === 'Présent').length || 0
    const absentDays = pointages?.filter(p => p.statut_jour === 'Absent').length || 0
    const restDays = pointages?.filter(p => p.statut_jour === 'Repos').length || 0
    const totalAmount = pointages?.reduce((sum, p) => sum + (p.montant_realise || 0), 0) || 0

    return {
      success: true,
      data: {
        totalDays,
        presentDays,
        absentDays,
        restDays,
        attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
        totalAmount,
        pointages
      }
    }
  } catch (error) {
    console.error('Error fetching employee attendance:', error)
    return { success: false, error: 'Erreur lors de la récupération de l\'assiduité' }
  }
}

export async function getEmployeeOfTheMonth(month, year) {
  const supabase = await createClient()
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    const { data: pointages, error } = await supabase
      .from('pointages')
      .select(`
        *,
        employes (
          id,
          prenom,
          nom
        )
      `)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .eq('statut_jour', 'Présent')

    if (error) throw error

    // Grouper par employé et compter les jours de présence
    const employeeAttendance = {}
    pointages?.forEach(pointage => {
      const employeeId = pointage.employe_id
      if (!employeeAttendance[employeeId]) {
        employeeAttendance[employeeId] = {
          employe_id: employeeId,
          employe: pointage.employes,
          presentDays: 0
        }
      }
      employeeAttendance[employeeId].presentDays++
    })

    // Trouver l'employé avec le plus de jours de présence
    const sortedEmployees = Object.values(employeeAttendance)
      .sort((a, b) => b.presentDays - a.presentDays)

    return {
      success: true,
      data: sortedEmployees[0] || null
    }
  } catch (error) {
    console.error('Error fetching employee of the month:', error)
    return { success: false, error: 'Erreur lors de la récupération de l\'employé du mois' }
  }
}