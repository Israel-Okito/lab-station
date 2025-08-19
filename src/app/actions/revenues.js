'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRevenue(data) {

  const supabase =  await createClient()
  try {
    const { data: revenue, error } = await supabase
      .from('revenus')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    revalidatePath('/revenus')
    return { success: true, data: revenue }
  } catch (error) {
    console.error('Error creating revenue:', error)
    return { success: false, error: 'Erreur lors de la création du revenu' }
  }
}

export async function updateRevenue(id, data) {
  const supabase = await createClient()
  try {
    const { data: revenue, error } = await supabase
      .from('revenus')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/revenus')
    return { success: true, data: revenue }
  } catch (error) {
    console.error('Error updating revenue:', error)
    return { success: false, error: 'Erreur lors de la modification du revenu' }
  }
}

export async function deleteRevenue(id) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('revenus')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/revenus')
    return { success: true }
  } catch (error) {
    console.error('Error deleting revenue:', error)
    return { success: false, error: 'Erreur lors de la suppression du revenu' }
  }
}