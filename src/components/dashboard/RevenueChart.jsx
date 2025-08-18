'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTranslations } from 'next-intl'



export function RevenueChart() {
  const t = useTranslations('dashboard')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/dashboard/chart-data')
        if (response.ok) {
          const data = await response.json()
          setChartData(data)
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <Card className="lab-card">
        <CardHeader>
          <CardTitle>{t('revenueAnalysis')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lab-card">
      <CardHeader>
        <CardTitle>Analyse des Revenus (7 derniers jours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
              formatter={(value, name) => [
                `${value.toFixed(2)} DT`, 
                name === 'revenus' ? 'Revenus' : 'Paiements employés'
              ]}
            />
            <Bar 
              dataKey="revenus" 
              fill="#FFD700" 
              name="revenus"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="paiements" 
              fill="#000000" 
              name="paiements"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}