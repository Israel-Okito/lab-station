'use client'

import { usePathname } from 'next/navigation'
import { AuthGuard } from './AuthGuard'
import { Navigation } from './Navigation'

export function ConditionalLayout({ children }) {
  const pathname = usePathname()
  
  // Pages publiques qui n'ont pas besoin d'authentification
  const publicPages = ['/login', '/unauthorized']
  
  // Vérifier si la page actuelle est publique
  const isPublicPage = publicPages.some(page => pathname.includes(page))
  
  if (isPublicPage) {
    // Pour les pages publiques, afficher directement le contenu
    return <>{children}</>
  }
  
  // Pour les pages protégées, utiliser AuthGuard avec Navigation
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="lg:ml-64 p-4">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
