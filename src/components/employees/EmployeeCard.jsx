'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, UserCheck, UserX, Eye, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { fr, arDZ } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { EditEmployeeModal } from './EditEmployeeModal'
import { ChangeStatusModal } from './ChangeStatusModal'
import { deleteEmployee } from '@/app/actions/employees'
import { EmployeeAttendanceModal } from './EmployeeAttendanceModal'
import { SalaryAdvanceModal } from './SalaryAdvanceModal'


export function EmployeeCard({ employee, onEmployeeUpdated }) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showSalaryAdvanceModal, setShowSalaryAdvanceModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [weeklyData, setWeeklyData] = useState(null)
  const [loadingWeekly, setLoadingWeekly] = useState(false)

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

  // Récupérer les données de la semaine en cours
  const fetchWeeklyData = async () => {
    setLoadingWeekly(true)
    try {
      const response = await fetch(`/api/employees/current-week?employeeId=${employee.id}`)
      if (response.ok) {
        const data = await response.json()
        setWeeklyData(data)
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error)
    } finally {
      setLoadingWeekly(false)
    }
  }

  useEffect(() => {
    fetchWeeklyData()
  }, [employee.id])

  // Fonction pour rafraîchir les données après ajout d'avance
  const handleAdvanceAdded = () => {
    fetchWeeklyData()
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
        
        <CardContent className="space-y-3">
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

           {/* Résumé de la semaine en cours */}
           {weeklyData && (
             <div className="mt-4 p-3 bg-gray-50 rounded-lg">
               <div className="text-sm font-medium text-gray-700 mb-2">Semaine en cours</div>
               <div className="grid grid-cols-2 gap-3 text-sm">
                 <div className="text-center p-2 bg-blue-50 rounded">
                   <div className="font-bold text-blue-600">{weeklyData.weeklyStats?.totalAmount?.toFixed(2) || '0.00'}</div>
                   <div className="text-xs text-blue-600">Réalisé</div>
                 </div>
                 <div className="text-center p-2 bg-purple-50 rounded">
                   <div className="font-bold text-purple-600">{weeklyData.weeklyStats?.totalAdvances?.toFixed(2) || '0.00'}</div>
                   <div className="text-xs text-purple-600">Avances</div>
                 </div>
               </div>
               <div className="mt-2 text-center">
                 <div className={`text-lg font-bold ${weeklyData.weeklyStats?.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                   {weeklyData.weeklyStats?.remainingAmount?.toFixed(2) || '0.00'} DT
                 </div>
                 <div className="text-xs text-gray-600">Reste à payer</div>
               </div>
             </div>
           )}

           {/* Boutons d'action */}
           <div className="pt-2 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAttendanceModal(true)}
              className="w-full lab-button-outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              {tCommon('viewMore')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSalaryAdvanceModal(true)}
              className="w-full lab-button-outline"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Avances sur Salaire
            </Button>
          </div>
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

      <EmployeeAttendanceModal
        employee={employee}
        open={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />

             <SalaryAdvanceModal
         employee={employee}
         open={showSalaryAdvanceModal}
         onClose={() => setShowSalaryAdvanceModal(false)}
         onAdvanceAdded={handleAdvanceAdded}
       />
    </>
  )
}