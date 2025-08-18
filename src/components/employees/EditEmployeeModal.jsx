'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { updateEmployee } from '@/app/actions/employees'

export function EditEmployeeModal({ employee, open, onClose, onEmployeeUpdated }) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: employee.nom,
    prenom: employee.prenom,
    date_embauche: employee.date_embauche
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nom.trim() || !formData.prenom.trim()) return

    setLoading(true)
    try {
      const result = await updateEmployee(employee.id, formData)
      if (result.success) {
        onEmployeeUpdated()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Erreur lors de la modification de l\'employé')
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
            {tCommon('edit')} - {employee.prenom} {employee.nom}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">{t('firstName')}</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                placeholder={t('firstName')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">{t('lastName')}</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder={t('lastName')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_embauche">{t('hireDate')}</Label>
            <Input
              id="date_embauche"
              type="date"
              value={formData.date_embauche}
              onChange={(e) => handleChange('date_embauche', e.target.value)}
              required
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