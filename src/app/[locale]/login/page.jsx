'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { auth } from '@/utils/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/UserContext'

export default function LoginPage() {
  const router = useRouter()
  const { refetch } = useUser()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Nettoyer complètement le localStorage avant la connexion
      localStorage.clear()
      
      // Connexion avec les identifiants
      const result = await auth.signIn(formData.email, formData.password)
      
      if (!result || !result.details) {
        throw new Error("Impossible de récupérer les détails de l'utilisateur")
      }
      
      // Stocker les données utilisateur de manière cohérente
      const userData = {
        user: {
          id: result.details.id,
          email: result.details.email,
          nom: result.details.nom,
        },
        role: result.details.role || null,
      }
      
      localStorage.setItem('userData', JSON.stringify(userData))
      localStorage.setItem('user_role', result.details.role)
      localStorage.setItem('user_name', result.details.nom)
      
      toast.success(`Bienvenue ${result.details.nom}!`)
      
      // Forcer le rechargement du contexte utilisateur
      await refetch()
      
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error("Erreur de connexion:", error)
      setError(error.message || "Erreur d'authentification")
      
      // Afficher un message spécifique si le compte est désactivé
      if (error.message.includes("désactivé")) {
        toast.error("Votre compte a été désactivé. Veuillez contacter l'administrateur.")
        
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        toast.error("Erreur d'authentification, veuillez vérifier vos identifiants")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #EBF8FF 0%, #E0E7FF 100%)'
    }}>
      <div className="w-full max-w-md ">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LAB STATION
          </h1>
          <p className="text-gray-600">
            Connexion sécurisée
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="lab-card shadow-xl" style={{
          backgroundColor: 'white',
          border: '2px solid #3B82F6',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)'
        }}>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              Se connecter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="admin@labstation.com"
                  required
                  className="w-full"
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pr-10"
                  />
                                  <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#6B7280'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>Erreur d'authentification, veuillez vérifier vos identifiants</AlertDescription>
                </Alert>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full"
                style={{
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

        
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} LAB STATION. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}