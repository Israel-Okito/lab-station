'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { updateRevenue } from '@/app/actions/revenues'


export function EditRevenueModal({ revenue, open, onClose, onRevenueUpdated }) {
  const t = useTranslations('revenues')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: revenue.date,
    montant_jour: revenue.montant_jour
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.montant_jour <= 0) return

    setLoading(true)
    try {
      const result = await updateRevenue(revenue.id, formData)
      if (result.success) {
        onRevenueUpdated()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error updating revenue:', error)
      alert('Erreur lors de la modification du revenu')
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
            Modifier le Revenu
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="montant_jour">{t('dailyAmount')} (DT)</Label>
            <Input
              id="montant_jour"
              type="number"
              min="0"
              step="0.01"
              value={formData.montant_jour}
              onChange={(e) => handleChange('montant_jour', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
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