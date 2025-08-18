'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { fr, arDZ } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { EditEmployeeModal } from './EditEmployeeModal'
import { ChangeStatusModal } from './ChangeStatusModal'
import { deleteEmployee } from '@/app/actions/employees'


export function EmployeeCard({ employee, onEmployeeUpdated }) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const dateLocale = locale === 'ar' ? arDZ : fr

  const getStatusColor = (status) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800'
      case 'Repos': return 'bg-blue-100 text-blue-800'
      case 'Absent': return 'bg-orange-100 text-orange-800'
      case 'Renvoyé': return 'bg-red-100 text-red-800'
      case 'Mise à pied': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return

    setIsDeleting(true)
    try {
      await deleteEmployee(employee.id)
      onEmployeeUpdated()
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    setShowEditModal(false)
    onEmployeeUpdated()
  }

  const handleStatusChange = () => {
    setShowStatusModal(false)
    onEmployeeUpdated()
  }

  return (
    <>
      <Card className="lab-card hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-lg">
                {employee.prenom} {employee.nom}
              </h3>
              <Badge className={getStatusColor(employee.statut)}>
                {t(`statuses.${employee.statut}`)}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                disabled={isDeleting}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusModal(true)}
                disabled={isDeleting}
              >
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>{t('hireDate')}:</strong> {' '}
            {format(new Date(employee.date_embauche), 'dd/MM/yyyy', { locale: dateLocale })}
          </div>
          
          {employee.date_sortie && (
            <div className="text-sm text-gray-600">
              <strong>{t('exitDate')}:</strong> {' '}
              {format(new Date(employee.date_sortie), 'dd/MM/yyyy', { locale: dateLocale })}
            </div>
          )}
        </CardContent>
      </Card>

      <EditEmployeeModal
        employee={employee}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEmployeeUpdated={handleEdit}
      />

      <ChangeStatusModal
        employee={employee}
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onStatusChanged={handleStatusChange}
      />
    </>
  )
}