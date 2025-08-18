'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { changeEmployeeStatus } from '@/app/actions/employees'


export function ChangeStatusModal({ employee, open, onClose, onStatusChanged }) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    statut: employee.statut,
    date_sortie: employee.date_sortie || '',
    raison: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      const updateData = {
        statut: formData.statut,
        raison: formData.raison
      }

      // Si le statut est "Renvoyé", inclure la date de sortie
      if (formData.statut === 'Renvoyé') {
        updateData.date_sortie = formData.date_sortie || new Date().toISOString().split('T')[0]
      } else if (employee.date_sortie && formData.statut !== 'Renvoyé') {
        // Si l'employé était renvoyé et change de statut, effacer la date de sortie
        updateData.date_sortie = null
      }

      const result = await changeEmployeeStatus(employee.id, updateData)
      if (result.success) {
        onStatusChanged()
        setFormData({
          statut: employee.statut,
          date_sortie: employee.date_sortie || '',
          raison: ''
        })
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error changing employee status:', error)
      alert('Erreur lors du changement de statut')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">
            {t('changeStatus')} - {employee.prenom} {employee.nom}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Statut actuel: <span className="font-bold">{t(`statuses.${employee.statut}`)}</span></Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut">Nouveau {t('status')}</Label>
            <Select value={formData.statut} onValueChange={(value) => handleChange('statut', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Actif', 'Repos', 'Absent', 'Renvoyé', 'Mise à pied'].map(status => (
                  <SelectItem key={status} value={status}>
                    {t(`statuses.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.statut === 'Renvoyé' && (
            <div className="space-y-2">
              <Label htmlFor="date_sortie">{t('exitDate')}</Label>
              <Input
                id="date_sortie"
                type="date"
                value={formData.date_sortie}
                onChange={(e) => handleChange('date_sortie', e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="raison">Raison (optionnel)</Label>
            <Textarea
              id="raison"
              value={formData.raison}
              onChange={(e) => handleChange('raison', e.target.value)}
              placeholder="Raison du changement de statut..."
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" className="lab-button" disabled={loading}>
              {loading ? tCommon('loading') : tCommon('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}