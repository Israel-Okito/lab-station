'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, DollarSign, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle, Eye, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

export function WeeklyPointageCard({ data, weekStart, onMarkAsPaid, onViewSummary }) {
  const t = useTranslations('pointage')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState(false)
  
  const { employe, pointages, avances, weeklyStats } = data
  const { totalDays, presentDays, absentDays, restDays, totalAmount, totalSalary, totalAdvances, pendingAdvances, approvedAdvances, remainingAmount, isWeekPaid } = weeklyStats

  const handleMarkAsPaid = async () => {
    setLoading(true)
    try {
      await onMarkAsPaid([employe.id])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (date) => {
    const pointage = pointages.find(p => isSameDay(new Date(p.date), new Date(date)))
    if (!pointage) return <AlertCircle className="w-4 h-4 text-gray-400" />
    
    switch (pointage.statut_jour) {
      case 'Présent':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Absent':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'Repos':
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Présent': return 'bg-green-100 text-green-800'
      case 'Repos': return 'bg-blue-100 text-blue-800'
      case 'Absent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  return (
    <Card className={`lab-card hover:shadow-lg transition-all duration-200 ${isWeekPaid ? 'border-green-200 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-gray-900">
              {employe.prenom} {employe.nom}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={isWeekPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {isWeekPaid ? t('weekPaid') : t('unpaid')}
              </Badge>
              {isWeekPaid && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSummary([data])}
              className="lab-button-outline"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{presentDays}</div>
            <div className="text-sm text-blue-600">{t('presentDays')}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalSalary.toFixed(2)}</div>
            <div className="text-sm text-green-600">Salaire</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{totalAmount.toFixed(2)}</div>
            <div className="text-sm text-orange-600">Réalisé</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalAdvances.toFixed(2)}</div>
            <div className="text-sm text-purple-600">Avances</div>
          </div>
        </div>

        {/* Barre de progression d'assiduité */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Taux d'assiduité</span>
            <span className="font-semibold">{attendanceRate.toFixed(1)}%</span>
          </div>
          <Progress value={attendanceRate} className="h-2" />
        </div>

        {/* Détails des jours */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Détail de la semaine</div>
          <div className="grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
              const date = new Date(weekStart)
              date.setDate(date.getDate() + index)
              return (
                <div key={day} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{day}</div>
                  <div className="flex justify-center">
                    {getStatusIcon(date)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Jours de repos:</span>
            <span className="font-medium">{restDays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jours absents:</span>
            <span className="font-medium">{absentDays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Montant réalisé:</span>
            <span className="font-medium">{totalAmount.toFixed(2)} DT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total avances:</span>
            <span className="font-medium">{totalAdvances.toFixed(2)} DT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avances en attente:</span>
            <span className="font-medium">{pendingAdvances.toFixed(2)} DT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avances approuvées:</span>
            <span className="font-medium">{approvedAdvances.toFixed(2)} DT</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-800 font-semibold">Reste à payer:</span>
            <span className={`font-bold ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {remainingAmount.toFixed(2)} DT
            </span>
          </div>
        </div>

        {/* Bouton d'action */}
        {!isWeekPaid && (
          <Button
            onClick={handleMarkAsPaid}
            disabled={loading || totalDays === 0}
            className="w-full lab-button"
          >
            {loading ? tCommon('loading') : t('markAsPaid')}
          </Button>
        )}

        {isWeekPaid && (
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-sm text-green-800 font-medium">
              {t('weekPaid')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
