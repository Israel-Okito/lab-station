'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEmployee(data){
  const supabase = createClient()
  try {
    const { data: employee, error } = await supabase
      .from('employes')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    // Créer une entrée dans l'historique
    await supabase
      .from('historique_statuts')
      .insert([{
        employe_id: employee.id,
        ancien_statut: null,
        nouveau_statut: data.statut,
        raison: 'Employé créé'
      }])

    revalidatePath('/employes')
    return { success: true, data: employee }
  } catch (error) {
    console.error('Error creating employee:', error)
    return { success: false, error: 'Erreur lors de la création de l\'employé' }
  }
}

export async function updateEmployee(id, data) {
  try {
    const { data: employee, error } = await supabase
      .from('employes')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/employes')
    return { success: true, data: employee }
  } catch (error) {
    console.error('Error updating employee:', error)
    return { success: false, error: 'Erreur lors de la modification de l\'employé' }
  }
}

export async function changeEmployeeStatus(id, data) {
  try {
    // Récupérer l'ancien statut
    const { data: currentEmployee } = await supabase
      .from('employes')
      .select('statut')
      .eq('id', id)
      .single()

    const updateData = { statut: data.statut }
    if (data.date_sortie !== undefined) {
      updateData.date_sortie = data.date_sortie
    }

    const { data: employee, error } = await supabase
      .from('employes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Créer une entrée dans l'historique
    await supabase
      .from('historique_statuts')
      .insert([{
        employe_id: id,
        ancien_statut: currentEmployee?.statut || null,
        nouveau_statut: data.statut,
        raison: data.raison || 'Changement de statut'
      }])

    revalidatePath('/employes')
    return { success: true, data: employee }
  } catch (error) {
    console.error('Error changing employee status:', error)
    return { success: false, error: 'Erreur lors du changement de statut' }
  }
}

export async function deleteEmployee(id) {
  try {
    const { error } = await supabase
      .from('employes')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/employes')
    return { success: true }
  } catch (error) {
    console.error('Error deleting employee:', error)
    return { success: false, error: 'Erreur lors de la suppression de l\'employé' }
  }
}