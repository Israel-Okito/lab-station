'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { EmployeePaymentsChart } from './EmployeePaymentsChart'
import { RevenueAnalysisChart } from './RevenueAnalysisChart'
import { EmployeePaymentsTable } from './EmployeePaymentsTable'
import { SalaryPaymentsChart } from './SalaryPaymentsChart'
import { TopPerformers } from './TopPerformers'

export function StatisticsManager() {
  const t = useTranslations('statistics')
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employes')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="lab-card">
        <CardHeader>
          <CardTitle>Filtres d'Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('period')}</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('selectEmployee')}</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allEmployees')}</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.prenom} {employee.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeePaymentsChart 
          period={selectedPeriod}
          employeeId={selectedEmployee}
        />
        <RevenueAnalysisChart 
          period={selectedPeriod}
        />
      </div>

      {/* Graphiques des salaires payés */}
      <SalaryPaymentsChart />

      {/* Top performeurs du mois */}
      <TopPerformers />

      {/* Tableau des paiements par employé */}
      <EmployeePaymentsTable 
        period={selectedPeriod}
        employeeId={selectedEmployee}
      />
    </div>
  )
}