import { StatisticsManager } from '@/components/statistics/StatisticsManager'
import { useTranslations } from 'next-intl'

export default function StatisticsPage() {
  const t = useTranslations('statistics')

  return (
    <div className="space-y-6">
      <div className="lab-gradient p-6 rounded-lg text-black">
        <h1 className="text-xl sm:text-3xl font-bold">{t('title')}</h1>
      </div>
      
      <StatisticsManager />
    </div>
  )
}