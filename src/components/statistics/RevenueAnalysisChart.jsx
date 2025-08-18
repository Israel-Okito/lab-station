'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'



export function RevenueAnalysisChart({ period }) {
  const t = useTranslations('statistics')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/statistics/revenue-analysis?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching revenue analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            {t('revenueAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
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
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          {t('revenueAnalysis')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={(value, name) => [
                `${value.toFixed(2)} DT`, 
                name === 'revenue' ? 'Revenus' : 'Paiements'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#FFD700" 
              strokeWidth={3}
              name="revenue"
            />
            <Line 
              type="monotone" 
              dataKey="payments" 
              stroke="#000000" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="payments"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}