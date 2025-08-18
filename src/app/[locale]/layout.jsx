
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Navigation } from '@/components/Navigation'
import "./global.css"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LAB STATION - Gestion Fast-Food',
  description: 'Système de gestion pour LAB STATION Tunis',
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'ar' }]
}

export default async function RootLayout({
  children,
  params: { locale }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto p-4">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}