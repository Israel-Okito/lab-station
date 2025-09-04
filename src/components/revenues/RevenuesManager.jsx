'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RevenueCard } from './RevenueCard'
import { AddRevenueModal } from './AddRevenueModal'
import { RevenueStats } from './RevenueStats'
import { useUser } from '@/lib/UserContext'

export function RevenuesManager() {
  const t = useTranslations('revenues')
  const [revenues, setRevenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const { role: userRole } = useUser()

  useEffect(() => {
    fetchRevenues()
  }, [])

  const fetchRevenues = async () => {
    try {
      const response = await fetch('/api/revenus')
      if (response.ok) {
        const data = await response.json()
        setRevenues(data)
      }
    } catch (error) {
      console.error('Error fetching revenues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevenueUpdated = () => {
    fetchRevenues()
  }

  const handleRevenueAdded = () => {
    setShowAddModal(false)
    fetchRevenues()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="lab-card">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RevenueStats revenues={revenues} />

      <Card className="lab-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenus Journaliers</CardTitle>
          {/* Bouton Ajouter - Seulement pour les admins */}
          {userRole === 'admin' && (
            <Button 
              onClick={() => setShowAddModal(true)}
              className="lab-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addRevenue')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {revenues.map(revenue => (
              <RevenueCard
                key={revenue.id}
                revenue={revenue}
                onRevenueUpdated={handleRevenueUpdated}
              />
            ))}
          </div>
          
          {revenues.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun revenu enregistré
            </div>
          )}
        </CardContent>
      </Card>

      <AddRevenueModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRevenueAdded={handleRevenueAdded}
      />
    </div>
  )
}