'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, DollarSign, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'



export function DashboardStats() {
  const t = useTranslations('dashboard')
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayRevenue: 0,
    weekRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: t('totalEmployees'),
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: t('activeEmployees'),
      value: stats.activeEmployees,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: t('todayRevenue'),
      value: `${stats.todayRevenue.toFixed(2)} DT`,
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      title: t('weekRevenue'),
      value: `${stats.weekRevenue.toFixed(2)} DT`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="lab-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="lab-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <Icon className={`h-6 w-6 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}