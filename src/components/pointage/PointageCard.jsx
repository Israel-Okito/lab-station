'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Lock, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { savePointage } from '@/app/actions/pointages'


export function PointageCard({ employee, selectedDate, isLocked, onPointageUpdated }) {
  const t = useTranslations('pointage')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    statut_jour: employee.pointage?.statut_jour || 'Présent',
    service: employee.pointage?.service || 'Matin',
    montant_realise: employee.pointage?.montant_realise || 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLocked) return

    setLoading(true)
    try {
      const result = await savePointage({
        employe_id: employee.id,
        date: selectedDate,
        ...formData
      })

      if (result.success) {
        onPointageUpdated()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error saving pointage:', error)
      alert('Erreur lors de la sauvegarde du pointage')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Présent': return 'bg-green-100 text-green-800'
      case 'Repos': return 'bg-blue-100 text-blue-800'
      case 'Absent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`lab-card ${isLocked ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-lg">
              {employee.prenom} {employee.nom}
            </h3>
            {employee.pointage && (
              <Badge className={getStatusColor(employee.pointage.statut_jour)}>
                {t(`statuses.${employee.pointage.statut_jour}`)}
              </Badge>
            )}
          </div>
          {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <Select 
              value={formData.statut_jour} 
              onValueChange={(value) => handleChange('statut_jour', value)}
              disabled={isLocked}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Présent', 'Repos', 'Absent'].map(status => (
                  <SelectItem key={status} value={status}>
                    {t(`statuses.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('service')}</Label>
            <Select 
              value={formData.service} 
              onValueChange={(value) => handleChange('service', value)}
              disabled={isLocked}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Matin', 'Soir', 'Les deux'].map(service => (
                  <SelectItem key={service} value={service}>
                    {t(`services.${service}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('amount')} (DT)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.montant_realise}
              onChange={(e) => handleChange('montant_realise', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              disabled={isLocked}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full lab-button" 
            disabled={loading || isLocked}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? tCommon('loading') : t('savePointage')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}