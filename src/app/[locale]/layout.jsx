import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Navigation } from '@/components/Navigation';


export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
 
export default async function Layout({
  children,
  params
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // export const metadata = {
  //   title: 'LAB STATION - Gestion Fast-Food',
  //   description: 'Système de gestion pour LAB STATION Tunis',
  // }
 
  return (
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <div  suppressHydrationWarning={true}>
        <NextIntlClientProvider>
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="lg:ml-64 p-4">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </div>
    </div>
  );
}