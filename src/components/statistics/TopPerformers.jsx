'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TopPerformers() {
  const t = useTranslations('statistics')
  const [topEmployees, setTopEmployees] = useState([])
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopPerformers()
  }, [])

  const fetchTopPerformers = async () => {
    try {
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()
      
      const response = await fetch(`/api/statistics/employee-of-month?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setTopEmployees(data.topEmployees || [])
        setMonthlyStats(data.monthlyStats)
      }
    } catch (error) {
      console.error('Error fetching top performers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-600" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-500" />
      case 2:
        return <Award className="w-5 h-5 text-orange-600" />
      default:
        return <TrendingUp className="w-4 h-4 text-blue-600" />
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 0:
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200'
      case 1:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200'
      case 2:
        return 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card className="lab-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lab-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          {t('topPerformers')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Statistiques globales du mois */}
          {monthlyStats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-600">{monthlyStats.totalEmployees}</div>
                <div className="text-sm text-blue-600">Total Employés</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600">{monthlyStats.totalPresentDays}</div>
                <div className="text-sm text-green-600">Jours Présence</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-yellow-600">{monthlyStats.averagePresentDays}</div>
                <div className="text-sm text-yellow-600">Moyenne/Jour</div>
              </div>
            </div>
          )}

          {/* Top 5 employés */}
          <div className="space-y-3">
            {topEmployees.map((employee, index) => (
              <div
                key={employee.employe_id}
                className={`p-4 rounded-lg border ${getRankColor(index)} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {employee.employe.prenom} {employee.employe.nom}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-green-100 text-green-800">
                          {employee.presentDays} jours présents
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {employee.totalAmount.toFixed(2)} DT réalisés
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      {employee.presentDays}
                    </div>
                    <div className="text-sm text-gray-600">jours</div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance</span>
                    <span className="font-medium">
                      {((employee.presentDays / 30) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(employee.presentDays / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {topEmployees.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500">
                Aucun employé performant trouvé pour ce mois
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
