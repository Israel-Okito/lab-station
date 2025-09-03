'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export function SalaryPaymentsChart() {
  const t = useTranslations('statistics')
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalaryPayments()
  }, [period])

  const fetchSalaryPayments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/statistics/salary-payments?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching salary payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <Card className="lab-card">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="lab-card">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            Aucune donnée de salaires payés disponible pour cette période
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lab-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {t('salaryPayments')}
        </CardTitle>
        <div className="flex gap-2">
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
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Graphique en barres des salaires */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Évolution des Salaires Payés</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toFixed(2)} DT`, 
                    name === 'totalSalary' ? 'Total Salaire' : 'Total Réalisé'
                  ]}
                />
                <Legend />
                <Bar dataKey="totalSalary" fill="#0088FE" name="Total Salaire" />
                <Bar dataKey="totalAmount" fill="#00C49F" name="Total Réalisé" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique en ligne du nombre d'employés */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Nombre d'Employés Payés</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="employeeCount" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Nombre d'Employés"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique circulaire de la répartition */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Répartition des Salaires</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalSalary"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} DT`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tableau récapitulatif */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Récapitulatif</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Période</th>
                    <th className="text-right p-2">Salaire Total</th>
                    <th className="text-right p-2">Montant Réalisé</th>
                    <th className="text-right p-2">Employés</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{item.label}</td>
                      <td className="text-right p-2 font-medium">
                        {item.totalSalary.toFixed(2)} DT
                      </td>
                      <td className="text-right p-2">
                        {item.totalAmount.toFixed(2)} DT
                      </td>
                      <td className="text-right p-2">
                        {item.employeeCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
