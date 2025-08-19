'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePointage(data) {
  const supabase  = await createClient()
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