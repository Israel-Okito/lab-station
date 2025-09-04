'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { captureUserDetails } from '@/utils/auth'

export function AuthGuard({ children, requiredRole = null }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userDetails = await captureUserDetails()

        if (!userDetails) {
          // Pas d'utilisateur connecté, rediriger vers la connexion
          router.push('/login')
          return
        }

        // Vérifier les permissions si un rôle est requis
        if (requiredRole) {
          if (userDetails.role === 'admin') {
            // Admin a accès à tout
            setUser(userDetails)
          } else if (userDetails.role === requiredRole) {
            // Manager a accès aux routes manager
            setUser(userDetails)
          } else {
            // Accès refusé, rediriger
            router.push('/')
            return
          }
        } else {
          // Pas de rôle requis, accès autorisé
          setUser(userDetails)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null
  }

  // Afficher le contenu protégé
  return children
}

// Composant pour les routes admin uniquement
export function AdminGuard({ children }) {
  return <AuthGuard requiredRole="admin">{children}</AuthGuard>
}

// Composant pour les routes manager et admin
export function ManagerGuard({ children }) {
  return <AuthGuard requiredRole="manager">{children}</AuthGuard>
}
