'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, DollarSign, Users, TrendingUp, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

export function WeeklySummaryModal({ open, onClose, weekData, weekStart }) {
  const t = useTranslations('pointage')
  const tCommon = useTranslations('common')

  if (!weekData || !weekStart) return null

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  
  // Calculer les totaux globaux
  const globalStats = weekData.reduce((totals, item) => {
    totals.totalDays += item.weeklyStats.totalDays
    totals.totalAmount += item.weeklyStats.totalAmount
    totals.totalSalary += item.weeklyStats.totalSalary
    totals.totalAdvances += item.weeklyStats.totalAdvances
    totals.remainingAmount += item.weeklyStats.remainingAmount
    totals.presentEmployees += item.weeklyStats.presentDays > 0 ? 1 : 0
    totals.paidEmployees += item.weeklyStats.isWeekPaid ? 1 : 0
    totals.totalPresentDays += item.weeklyStats.presentDays
    totals.totalAbsentDays += item.weeklyStats.absentDays
    totals.totalRestDays += item.weeklyStats.restDays
    return totals
  }, {
    totalDays: 0,
    totalAmount: 0,
    totalSalary: 0,
    totalAdvances: 0,
    remainingAmount: 0,
    presentEmployees: 0,
    paidEmployees: 0,
    totalPresentDays: 0,
    totalAbsentDays: 0,
    totalRestDays: 0
  })

  const averageAttendance = globalStats.presentEmployees > 0 
    ? (globalStats.totalPresentDays / globalStats.totalDays) * 100 
    : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Résumé Hebdomadaire
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de la semaine */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Semaine du {format(weekStart, 'dd MMMM yyyy', { locale: fr })} au {format(weekEnd, 'dd MMMM yyyy', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{globalStats.totalDays}</div>
                  <div className="text-sm text-blue-600">Total Jours</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{globalStats.totalSalary.toFixed(2)}</div>
                  <div className="text-sm text-green-600">Total Réalisé</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{globalStats.totalAdvances.toFixed(2)}</div>
                  <div className="text-sm text-purple-600">Total Avances</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{globalStats.remainingAmount.toFixed(2)}</div>
                  <div className="text-sm text-orange-600">Reste à Payer</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{globalStats.presentEmployees}</div>
                  <div className="text-sm text-indigo-600">Employés Présents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques d'assiduité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques d'Assiduité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{globalStats.totalPresentDays}</div>
                  <div className="text-sm text-green-600">Jours de Présence</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{globalStats.totalAbsentDays}</div>
                  <div className="text-sm text-red-600">Jours d'Absence</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{globalStats.totalRestDays}</div>
                  <div className="text-sm text-blue-600">Jours de Repos</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{averageAttendance.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Taux d'Assiduité Moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détail par employé */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détail par Employé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekData.map((item) => {
                  const { employe, weeklyStats } = item
                  const attendanceRate = weeklyStats.totalDays > 0 
                    ? (weeklyStats.presentDays / weeklyStats.totalDays) * 100 
                    : 0

                  return (
                    <div key={employe.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {employe.prenom} {employe.nom}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={weeklyStats.isWeekPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {weeklyStats.isWeekPaid ? t('weekPaid') : t('unpaid')}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {attendanceRate.toFixed(1)}% assiduité
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{weeklyStats.presentDays}</div>
                          <div className="text-gray-600">Présent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{weeklyStats.absentDays}</div>
                          <div className="text-gray-600">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{weeklyStats.totalSalary.toFixed(2)}</div>
                          <div className="text-gray-600">Réalisé</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{weeklyStats.totalAdvances.toFixed(2)}</div>
                          <div className="text-gray-600">Avances</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${weeklyStats.remainingAmount >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                            {weeklyStats.remainingAmount.toFixed(2)}
                          </div>
                          <div className="text-gray-600">Reste à Payer</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="lab-button-outline">
              {tCommon('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
