'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Calendar, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function EmployeeOfWeek() {
  const t = useTranslations('dashboard')
  const tEmployees = useTranslations('employees')
  const [employeeOfWeek, setEmployeeOfWeek] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployeeOfWeek()
  }, [])

  const fetchEmployeeOfWeek = async () => {
    try {
      const response = await fetch('/api/statistics/employee-of-week', {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        setEmployeeOfWeek(data.employeeOfTheWeek)
      }
    } catch (error) {
      console.error('Error fetching employee of the week:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="lab-card">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!employeeOfWeek) {
    return (
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Employé de la Semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <div className="text-gray-500">
              Aucun employé de la semaine sélectionné pour le moment
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lab-card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          Employé de la Semaine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {/* Couronne et badge */}
          <div className="relative">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <Badge className="absolute -top-2 -right-2 bg-yellow-600 text-white">
              #1
            </Badge>
          </div>

          {/* Nom de l'employé */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {employeeOfWeek.employe.prenom} {employeeOfWeek.employe.nom}
            </h3>
            <p className="text-gray-600">Employé de la semaine</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {employeeOfWeek.presentDays}
              </div>
              <div className="text-sm text-gray-600">
                {tEmployees('presentDays')}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {employeeOfWeek.totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                DT Réalisés
              </div>
            </div>
          </div>

          {/* Message de félicitations */}
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <div className="text-sm text-yellow-800 font-medium">
              🎉 Félicitations pour votre excellente assiduité !
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
