'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmployeeCard } from './EmployeeCard'
import { AddEmployeeModal } from './AddEmployeeModal'
import { useTranslations } from 'next-intl'

export function EmployeesManager() {
  const t = useTranslations('employees')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(employee =>
    `${employee.prenom} ${employee.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEmployeeUpdated = () => {
    fetchEmployees()
  }

  const handleEmployeeAdded = () => {
    setShowAddModal(false)
    fetchEmployees()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
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
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          onClick={() => setShowAddModal(true)}
          className="lab-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addEmployee')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map(employee => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEmployeeUpdated={handleEmployeeUpdated}
          />
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <Card className="lab-card">
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'Aucun employé trouvé' : 'Aucun employé enregistré'}
            </div>
          </CardContent>
        </Card>
      )}

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />
    </div>
  )
}