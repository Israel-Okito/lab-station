'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { 
  startOfWeek, 
  startOfMonth, 
  startOfQuarter, 
  startOfYear, 
  isWithinInterval 
} from 'date-fns'


export function RevenueStats({ revenues }) {
  const t = useTranslations('revenues')

  const calculateTotalForPeriod = (startDate) => {
    const now = new Date()
    return revenues
      .filter(revenue => 
        isWithinInterval(new Date(revenue.date), { start: startDate, end: now })
      )
      .reduce((sum, revenue) => sum + revenue.montant_jour, 0)
  }

  const stats = [
    {
      title: t('weeklyTotal'),
      value: calculateTotalForPeriod(startOfWeek(new Date(), { weekStartsOn: 1 })),
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: t('monthlyTotal'),
      value: calculateTotalForPeriod(startOfMonth(new Date())),
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: t('quarterlyTotal'),
      value: calculateTotalForPeriod(startOfQuarter(new Date())),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: t('yearlyTotal'),
      value: calculateTotalForPeriod(startOfYear(new Date())),
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="lab-card hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {stat.value.toFixed(2)} DT
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}