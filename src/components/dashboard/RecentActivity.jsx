'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, DollarSign } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { fr, arDZ } from 'date-fns/locale'
import { useLocale } from 'next-intl'



export function RecentActivity() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const [pointages, setPointages] = useState([])
  const [revenues, setRevenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const [pointagesRes, revenuesRes] = await Promise.all([
          fetch('/api/pointages/recent', {
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('/api/revenus/recent', {
            headers: { 'Content-Type': 'application/json' },
          })
        ])

        if (pointagesRes.ok) {
          const pointagesData = await pointagesRes.json()
          setPointages(pointagesData)
        }

        if (revenuesRes.ok) {
          const revenuesData = await revenuesRes.json()
          setRevenues(revenuesData)
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  const dateLocale = locale === 'ar' ? arDZ : fr

  return (
    <div className="space-y-6">
      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            {t('recentPointages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                </div>
              ))}
            </div>
          ) : pointages.length > 0 ? (
            <div className="space-y-3">
              {pointages.map(pointage => (
                <div key={pointage.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {pointage.employe_prenom} {pointage.employe_nom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(pointage.date), 'dd/MM/yyyy', { locale: dateLocale })} - {pointage.service}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      pointage.statut_jour === 'Présent' ? 'text-green-600' :
                      pointage.statut_jour === 'Repos' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {pointage.statut_jour}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pointage.montant_realise.toFixed(2)} DT
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun pointage récent</p>
          )}
        </CardContent>
      </Card>

      <Card className="lab-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-600" />
            {t('recentRevenues')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                </div>
              ))}
            </div>
          ) : revenues.length > 0 ? (
            <div className="space-y-3">
              {revenues.map(revenue => (
                <div key={revenue.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    {format(new Date(revenue.date), 'dd/MM/yyyy', { locale: dateLocale })}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {revenue.montant_jour.toFixed(2)} DT
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun revenu récent</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}