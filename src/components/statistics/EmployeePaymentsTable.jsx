'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign } from 'lucide-react'
import { useTranslations } from 'next-intl'



export function EmployeePaymentsTable({ period, employeeId }) {
  const t = useTranslations('statistics')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPaid, setTotalPaid] = useState(0)

  useEffect(() => {
    fetchData()
  }, [period, employeeId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/statistics/employee-payments-table?period=${period}&employeeId=${employeeId}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
        setTotalPaid(result.total)
      }
    } catch (error) {
      console.error('Error fetching employee payments table data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            {t('totalPaid')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lab-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            {t('totalPaid')}
          </div>
          <div className="text-xl font-bold text-green-600">
            {totalPaid.toFixed(2)} DT
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employé</TableHead>
              <TableHead className="text-right">Montant Total</TableHead>
              <TableHead className="text-right">Nombre de jours</TableHead>
              <TableHead className="text-right">Moyenne/jour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((employee, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {employee.name}
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {employee.total.toFixed(2)} DT
                </TableCell>
                <TableCell className="text-right">
                  {employee.days}
                </TableCell>
                <TableCell className="text-right">
                  {employee.average.toFixed(2)} DT
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune donnée disponible pour cette période
          </div>
        )}
      </CardContent>
    </Card>
  )
}