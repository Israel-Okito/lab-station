'use client'

import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const switchLanguage = () => {
    const newLocale = locale === 'fr' ? 'ar' : 'fr'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={switchLanguage}
      className="flex items-center gap-2"
    >
      <Languages className="w-4 h-4" />
      {locale === 'fr' ? 'العربية' : 'Français'}
    </Button>
  )
}