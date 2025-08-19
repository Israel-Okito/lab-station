'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  DollarSign, 
  BarChart3,
} from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ChefHat } from 'lucide-react'

const navigation = [
  { name: 'dashboard', href: '', icon: LayoutDashboard },
  { name: 'employees', href: '/employes', icon: Users },
  { name: 'pointage', href: '/pointage', icon: Clock },
  { name: 'revenues', href: '/revenus', icon: DollarSign },
  { name: 'statistics', href: '/statistiques', icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  return (
    <nav className="bg-white shadow-lg border-b-4 border-yellow-400">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
              <div className="bg-yellow-500 rounded-lg p-2">
                <ChefHat
                 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">LAB STATION</span>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.endsWith(item.href) && 
                    (item.href === '' ? pathname.split('/').length <= 2 : true)
                  
                  return (
                    <Link
                      key={item.name}
                      href={`/${pathname.split('/')[1]}${item.href}`}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                        isActive
                          ? 'bg-yellow-400 text-black'
                          : 'text-gray-700 hover:bg-yellow-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t(item.name)}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  )
}