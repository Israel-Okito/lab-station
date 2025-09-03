'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { startOfWeek, endOfWeek, addWeeks, format, isSameWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { WeeklyPointageCard } from './WeeklyPointageCard'
import { WeeklySummaryModal } from './WeeklySummaryModal'

export function WeeklyPointageManager() {
  const t = useTranslations('pointage')
  const tCommon = useTranslations('common')
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [weeklyData, setWeeklyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [selectedWeekData, setSelectedWeekData] = useState(null)

  useEffect(() => {
    fetchWeeklyPointages()
  }, [currentWeekStart])

  const fetchWeeklyPointages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pointages/weekly?weekStart=${format(currentWeekStart, 'yyyy-MM-dd')}`)
      if (response.ok) {
        const data = await response.json()
        setWeeklyData(data.weeklyData || [])
      }
    } catch (error) {
      console.error('Error fetching weekly pointages:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1))
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const handleMarkAsPaid = async (employeeIds) => {
    try {
      const response = await fetch('/api/pointages/mark-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStart: format(currentWeekStart, 'yyyy-MM-dd'),
          employeeIds
        })
      })

      if (response.ok) {
        // Recharger les données
        fetchWeeklyPointages()
      } else {
        console.error('Error marking week as paid')
      }
    } catch (error) {
      console.error('Error marking week as paid:', error)
    }
  }

  const handleViewSummary = (weekData) => {
    setSelectedWeekData(weekData)
    setShowSummaryModal(true)
  }

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 })

  // Calculer les totaux globaux de la semaine
  const weeklyTotals = weeklyData.reduce((totals, item) => {
    totals.totalDays += item.weeklyStats.totalDays
    totals.totalPresentDays += item.weeklyStats.presentDays
    totals.totalAbsentDays += item.weeklyStats.absentDays
    totals.totalRestDays += item.weeklyStats.restDays
    totals.totalSalary += item.weeklyStats.totalSalary
    totals.totalAmount += item.weeklyStats.totalAmount
    totals.totalAdvances += item.weeklyStats.totalAdvances
    totals.pendingAdvances += item.weeklyStats.pendingAdvances
    totals.approvedAdvances += item.weeklyStats.approvedAdvances
    totals.remainingAmount += item.weeklyStats.remainingAmount
    totals.paidEmployees += item.weeklyStats.isWeekPaid ? 1 : 0
    return totals
  }, {
    totalDays: 0,
    totalPresentDays: 0,
    totalAbsentDays: 0,
    totalRestDays: 0,
    totalSalary: 0,
    totalAmount: 0,
    totalAdvances: 0,
    pendingAdvances: 0,
    approvedAdvances: 0,
    remainingAmount: 0,
    paidEmployees: 0
  })

  const averageAttendance = weeklyTotals.totalDays > 0 
    ? (weeklyTotals.totalPresentDays / weeklyTotals.totalDays) * 100 
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="lab-card">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="lab-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation des semaines */}
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {t('weeklyTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousWeek}
                className="lab-button-outline"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-lg font-semibold">
                  Semaine du {format(currentWeekStart, 'dd MMMM yyyy', { locale: fr })} au {format(currentWeekEnd, 'dd MMMM yyyy', { locale: fr })}
                </div>
                <div className="text-sm text-gray-600">
                  {isCurrentWeek ? t('currentWeek') : 'Semaine sélectionnée'}
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={goToNextWeek}
                className="lab-button-outline"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={goToCurrentWeek}
              variant="outline"
              className="lab-button-outline"
            >
              {t('currentWeek')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résumé de la semaine */}
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            {t('weeklySummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{weeklyData.length}</div>
              <div className="text-sm text-blue-600">Total Employés</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{weeklyTotals.totalPresentDays}</div>
              <div className="text-sm text-green-600">Jours Présence</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{weeklyTotals.totalSalary.toFixed(2)}</div>
              <div className="text-sm text-yellow-600">Total Salaires</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{weeklyTotals.paidEmployees}</div>
              <div className="text-sm text-purple-600">Semaines Payées</div>
            </div>
          </div>

          {/* Statistiques des avances */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-600">{weeklyTotals.totalAdvances.toFixed(2)}</div>
              <div className="text-sm text-indigo-600">Total Avances</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{weeklyTotals.pendingAdvances.toFixed(2)}</div>
              <div className="text-sm text-yellow-600">En Attente</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{weeklyTotals.approvedAdvances.toFixed(2)}</div>
              <div className="text-sm text-green-600">Approuvées</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{weeklyTotals.remainingAmount.toFixed(2)}</div>
              <div className="text-sm text-red-600">Reste à Payer</div>
            </div>
          </div>

          {/* Statistiques d'assiduité */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{averageAttendance.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Taux d'Assiduité</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{weeklyTotals.totalRestDays}</div>
                <div className="text-sm text-gray-600">Jours de Repos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{weeklyTotals.totalAbsentDays}</div>
                <div className="text-sm text-gray-600">Jours d'Absence</div>
              </div>
            </div>
          </div>

          {/* Bouton pour voir le résumé détaillé */}
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => handleViewSummary(weeklyData)}
              className="lab-button"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Voir le Résumé Détaillé
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cartes des employés */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {weeklyData.map((item) => (
          <WeeklyPointageCard
            key={item.employe.id}
            data={item}
            weekStart={currentWeekStart}
            onMarkAsPaid={handleMarkAsPaid}
            onViewSummary={handleViewSummary}
          />
        ))}
      </div>

      {weeklyData.length === 0 && (
        <Card className="lab-card">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              Aucun employé actif trouvé pour cette semaine
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de résumé hebdomadaire */}
      <WeeklySummaryModal
        open={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        weekData={selectedWeekData}
        weekStart={currentWeekStart}
      />
    </div>
  )
}
