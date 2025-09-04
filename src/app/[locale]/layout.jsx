import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { UserProvider } from '@/lib/UserContext';


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
      <div suppressHydrationWarning={true}>
        <NextIntlClientProvider>
          <UserProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </UserProvider>
        </NextIntlClientProvider>
      </div>
    </div>
  );
}