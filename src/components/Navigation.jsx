"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, Users, Clock, DollarSign, BarChart3, Menu, X, LogOut, User, Shield } from "lucide-react"
import { ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { auth, captureUserDetails } from "@/utils/auth"
import { Settings } from "lucide-react"

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Employés", href: "/employes", icon: Users },
  { name: "Pointage", href: "/pointage", icon: Clock },
  { name: "Revenus", href: "/revenus", icon: DollarSign },
  { name: "Statistiques", href: "/statistiques", icon: BarChart3 },
  { name: "Paramètres", href: "/utilisateurs", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userDetails = await captureUserDetails()
        setUser(userDetails)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Si pas d'utilisateur connecté, rediriger vers la connexion
  if (!loading && !user) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 px-4 py-2 rounded-md bg-white border border-border text-foreground hover:bg-primary/10"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-border z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center space-x-2 p-6 border-b border-border">
            <div className="bg-yellow-400 rounded-lg p-2">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-xl font-bold text-foreground">LAB STATION</span>
              {user && (
                <div className="text-xs text-muted-foreground mt-1">
                  {user.prenom} {user.nom} ({user.role})
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 py-6">
            <div className="space-y-2 px-4">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname.endsWith(item.href) && (item.href === "" ? pathname.split("/").length <= 2 : true)

                return (
                  <Link
                    key={item.name}
                    href={`${item.href}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="border-t border-border p-4 space-y-4">
            <LanguageSwitcher />
            
            {/* Informations utilisateur */}
            {user && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium uppercase">
                    {user.role}
                  </span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  size="sm"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
