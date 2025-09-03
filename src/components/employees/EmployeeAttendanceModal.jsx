'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function EmployeeAttendanceModal({ employee, open, onClose }) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const [period, setPeriod] = useState('month')
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && employee) {
      fetchAttendanceData()
    }
  }, [open, employee, period])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/employes/attendance?employeeId=${employee.id}&period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceData(data)
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {t('attendance')} - {employee.prenom} {employee.nom}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection de la période */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Période d'analyse:</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semaine</SelectItem>
                    <SelectItem value="month">Mois</SelectItem>
                    <SelectItem value="year">Année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ) : attendanceData ? (
            <>
              {/* Statistiques principales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques d'Assiduité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {attendanceData.stats.totalDays}
                      </div>
                      <div className="text-sm text-blue-600">Total Jours</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {attendanceData.stats.presentDays}
                      </div>
                      <div className="text-sm text-green-600">{t('presentDays')}</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {attendanceData.stats.absentDays}
                      </div>
                      <div className="text-sm text-red-600">{t('absentDays')}</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {attendanceData.stats.attendanceRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-yellow-600">{t('attendanceRate')}</div>
                    </div>
                  </div>

                  {/* Barre de progression d'assiduité */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux d'assiduité global</span>
                      <span className="font-semibold">{attendanceData.stats.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={attendanceData.stats.attendanceRate} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques financières */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques Financières</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {attendanceData.stats.totalSalary.toFixed(2)} DT
                      </div>
                      <div className="text-sm text-green-600">Total Salaire</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">
                        {attendanceData.stats.totalAmount.toFixed(2)} DT
                      </div>
                      <div className="text-sm text-yellow-600">{t('totalEarnings')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analyse hebdomadaire */}
              {attendanceData.weeklyStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analyse Hebdomadaire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {attendanceData.weeklyStats.map((week, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">
                              Semaine du {format(new Date(week.weekStart), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {week.days} jours
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-green-600">{week.presentDays}</div>
                              <div className="text-gray-600">Présent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-red-600">{week.absentDays}</div>
                              <div className="text-gray-600">Absent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-600">{week.restDays}</div>
                              <div className="text-gray-600">Repos</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-yellow-600">
                                {week.totalSalary.toFixed(2)}
                              </div>
                              <div className="text-gray-600">Salaire</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Détail des pointages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détail des Pointages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attendanceData.pointages.map((pointage, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {pointage.statut_jour === 'Présent' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {pointage.statut_jour === 'Absent' && <XCircle className="w-4 h-4 text-red-600" />}
                            {pointage.statut_jour === 'Repos' && <Clock className="w-4 h-4 text-blue-600" />}
                            <span className="font-medium">{pointage.statut_jour}</span>
                          </div>
                          <span className="text-gray-600">
                            {format(new Date(pointage.date), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            {pointage.service}
                          </span>
                          {pointage.montant_realise > 0 && (
                            <span className="font-medium text-green-600">
                              {pointage.montant_realise.toFixed(2)} DT
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

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
