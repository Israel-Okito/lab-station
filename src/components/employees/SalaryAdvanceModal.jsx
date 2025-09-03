'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { addSalaryAdvance, getSalaryAdvances } from '@/app/actions/employees'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function SalaryAdvanceModal({ employee, open, onClose, onAdvanceAdded }) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const [loading, setLoading] = useState(false)
  const [advances, setAdvances] = useState([])
  const [formData, setFormData] = useState({
    montant: '',
    date_avance: new Date().toISOString().split('T')[0],
    description: ''
  })

  useEffect(() => {
    if (open && employee) {
      fetchAdvances()
    }
  }, [open, employee])

  const fetchAdvances = async () => {
    try {
      const result = await getSalaryAdvances(employee.id)
      if (result.success) {
        setAdvances(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching advances:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.montant || !formData.date_avance) return

    setLoading(true)
    try {
      const result = await addSalaryAdvance(
        employee.id,
        parseFloat(formData.montant),
        formData.date_avance,
        formData.description
      )

      if (result.success) {
        // Réinitialiser le formulaire
        setFormData({
          montant: '',
          date_avance: new Date().toISOString().split('T')[0],
          description: ''
        })
        // Recharger les avances
        fetchAdvances()
        // Notifier le composant parent pour mettre à jour les données
        if (onAdvanceAdded) {
          onAdvanceAdded()
        }
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error adding advance:', error)
      alert('Erreur lors de l\'ajout de l\'avance')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800'
      case 'Approuvée': return 'bg-green-100 text-green-800'
      case 'Refusée': return 'bg-red-100 text-red-800'
      case 'Payée': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'En attente': return <Clock className="w-4 h-4" />
      case 'Approuvée': return <CheckCircle className="w-4 h-4" />
      case 'Refusée': return <XCircle className="w-4 h-4" />
      case 'Payée': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const totalAdvances = advances
    .filter(a => a.statut === 'Approuvée' || a.statut === 'Payée')
    .reduce((sum, advance) => sum + advance.montant, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Avances sur Salaire - {employee.prenom} {employee.nom}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé des avances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé des Avances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{advances.length}</div>
                  <div className="text-sm text-blue-600">Total Avances</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{totalAdvances.toFixed(2)}</div>
                  <div className="text-sm text-green-600">Total Avancé</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire d'ajout d'avance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nouvelle Avance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Montant (DT)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.montant}
                      onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de l'avance</Label>
                    <Input
                      type="date"
                      value={formData.date_avance}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_avance: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description (optionnel)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Raison de l'avance..."
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  className="lab-button"
                  disabled={loading || !formData.montant}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? tCommon('loading') : 'Ajouter l\'avance'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historique des avances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des Avances</CardTitle>
            </CardHeader>
            <CardContent>
              {advances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune avance enregistrée
                </div>
              ) : (
                <div className="space-y-3">
                  {advances.map((advance, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(advance.statut)}
                          <Badge className={getStatusColor(advance.statut)}>
                            {advance.statut}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {advance.montant.toFixed(2)} DT
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(advance.date_avance), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      {advance.description && (
                        <div className="text-sm text-gray-600 mt-2">
                          {advance.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="lab-button-outline">
              {tCommon('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
