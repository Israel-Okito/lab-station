import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { EmployeeOfWeek } from '@/components/dashboard/EmployeeOfWeek'
import { useTranslations } from 'next-intl'

export default function Dashboard() {
  const t = useTranslations('dashboard')

  return (
    <div className="space-y-6">
      <div className="lab-gradient p-6 rounded-lg text-black">
        <h1 className="text-xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-lg opacity-90">{t('welcome')}</p>
      </div>

      <DashboardStats />

      <EmployeeOfWeek />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <RecentActivity />
      </div>

            
    </div>
  )
}