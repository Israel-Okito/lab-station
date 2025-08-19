import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
    const supabase =  await createClient()
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Récupérer tous les employés actifs
    const { data: employees, error: employeesError } = await supabase
      .from('employes')
      .select('*')
      .eq('statut', 'Actif')
      .order('prenom')

    if (employeesError) throw employeesError

    // Récupérer les pointages pour cette date
    const { data: pointages, error: pointagesError } = await supabase
      .from('pointages')
      .select('*')
      .eq('date', date)

    if (pointagesError) throw pointagesError

    // Combiner les données
    const employeesWithPointages = employees?.map(employee => {
      const pointage = pointages?.find(p => p.employe_id === employee.id)
      return {
        ...employee,
        pointage
      }
    }) || []

    return NextResponse.json(employeesWithPointages)
  } catch (error) {
    console.error('Error fetching pointages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pointages' },
      { status: 500 }
    )
  }
}