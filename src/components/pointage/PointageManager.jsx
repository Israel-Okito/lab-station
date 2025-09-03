'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PointageCard } from './PointageCard'
import { WeeklyPointageManager } from './WeeklyPointageManager'
import { isToday, isBefore, startOfDay } from 'date-fns'


export function PointageManager() {
  const t = useTranslations('pointage')
  const tCommon = useTranslations('common')
  const [viewMode, setViewMode] = useState('daily') // 'daily' ou 'weekly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchEmployeesWithPointages()
    }
  }, [selectedDate, viewMode])

  const fetchEmployeesWithPointages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pointages?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees with pointages:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDateLocked = () => {
    const selected = new Date(selectedDate)
    const today = new Date()
    return isBefore(selected, startOfDay(today)) && !isToday(selected)
  }

  const handlePointageUpdated = () => {
    fetchEmployeesWithPointages()
  }

  // Fonction pour forcer la synchronisation des données (manuel uniquement)
  const forceSync = () => {
    fetchEmployeesWithPointages()
  }

  if (viewMode === 'weekly') {
    return <WeeklyPointageManager onBackToDaily={() => setViewMode('daily')} />
  }

  if (loading) {
    return (
      <div className="space-y-4">
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
      {/* Sélection du mode de vue */}
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Mode de Pointage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'daily' ? 'default' : 'outline'}
              onClick={() => setViewMode('daily')}
              className="lab-button"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Pointage Quotidien
            </Button>
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'outline'}
              onClick={() => setViewMode('weekly')}
              className="lab-button-outline"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pointage Hebdomadaire
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sélection de la date (mode quotidien uniquement) */}
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            Sélection de la date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
            
            {isDateLocked() && (
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md text-sm font-medium">
                {t('locked')} - {t('lockedMessage')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map(employee => (
          <PointageCard
            key={employee.id}
            employee={employee}
            selectedDate={selectedDate}
            isLocked={isDateLocked()}
            onPointageUpdated={handlePointageUpdated}
            onForceSync={forceSync}
          />
        ))}
      </div>

      {employees.length === 0 && !loading && (
        <Card className="lab-card">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              Aucun employé actif trouvé
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}