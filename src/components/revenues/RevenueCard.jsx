'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr, arDZ } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { deleteRevenue } from '@/app/actions/revenues'
import { EditRevenueModal } from './EditRevenueModal'

export function RevenueCard({ revenue, onRevenueUpdated }) {
  const locale = useLocale()
  const [showEditModal, setShowEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const dateLocale = locale === 'ar' ? arDZ : fr

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) return

    setIsDeleting(true)
    try {
      await deleteRevenue(revenue.id)
      onRevenueUpdated()
    } catch (error) {
      console.error('Error deleting revenue:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    setShowEditModal(false)
    onRevenueUpdated()
  }

  return (
    <>
      <Card className="lab-card hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-green-600">
              {revenue.montant_jour.toFixed(2)} DT
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
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {format(new Date(revenue.date), 'dd/MM/yyyy', { locale: dateLocale })}
          </div>
        </CardContent>
      </Card>

      <EditRevenueModal
        revenue={revenue}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onRevenueUpdated={handleEdit}
      />
    </>
  )
}