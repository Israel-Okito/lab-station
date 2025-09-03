import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { startOfWeek, endOfWeek, format } from 'date-fns'

export async function POST(request) {
  const supabase = await createClient()
  try {
    const { weekStart, employeeIds } = await request.json()
    
    if (!weekStart || !employeeIds || !Array.isArray(employeeIds)) {
      return NextResponse.json(
        { error: 'Paramètres manquants ou invalides' },
        { status: 400 }
      )
    }
    
    const weekEnd = endOfWeek(new Date(weekStart), { weekStartsOn: 1 })
    
    // Marquer tous les pointages de la semaine comme payés
    const { error } = await supabase
      .from('pointages')
      .update({ 
        paye: true, 
        date_paiement: new Date().toISOString() 
      })
      .in('employe_id', employeeIds)
      .gte('date', format(new Date(weekStart), 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Semaine marquée comme payée avec succès' 
    })
  } catch (error) {
    console.error('Error marking week as paid:', error)
    return NextResponse.json(
      { error: 'Erreur lors du marquage de la semaine comme payée' },
      { status: 500 }
    )
  }
}
