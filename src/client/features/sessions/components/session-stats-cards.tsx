import { Activity, DollarSign, TrendingUp, FolderOpen } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { SessionStats } from '@/lib/api'

interface SessionStatsCardsProps {
  stats: SessionStats | undefined
  isLoading: boolean
}

function formatProjectName(path: string | undefined, fallback: string): string {
  const value = path?.trim()
  if (!value) return fallback

  const parts = value.split('-')
  return parts[parts.length - 1] || value
}

export function SessionStatsCards({ stats, isLoading }: SessionStatsCardsProps) {
  const { text } = useLocale()

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card className='relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full' />
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {text('总会话数', 'Total Sessions')}
          </CardTitle>
          <div className='rounded-full bg-red-500/10 p-2'>
            <Activity className='h-4 w-4 text-red-500' />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className='h-8 w-16 mb-1' />
              <Skeleton className='h-4 w-24' />
            </>
          ) : (
            <>
              <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                {formatNumber(stats?.totalSessions ?? 0)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats?.totalSessionsThisMonth ?? 0} {text('本月', 'This month')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className='relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full' />
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {text('总成本', 'Total Cost')}
          </CardTitle>
          <div className='rounded-full bg-rose-500/10 p-2'>
            <DollarSign className='h-4 w-4 text-rose-500' />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className='h-8 w-24 mb-1' />
              <Skeleton className='h-4 w-32' />
            </>
          ) : (
            <>
              <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                {formatCurrency(stats?.totalCost ?? 0)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {text('全部会话累计', 'Across all sessions')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className='relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full' />
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {text('平均每会话成本', 'Avg Cost / Session')}
          </CardTitle>
          <div className='rounded-full bg-red-500/10 p-2'>
            <TrendingUp className='h-4 w-4 text-red-500' />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className='h-8 w-20 mb-1' />
              <Skeleton className='h-4 w-28' />
            </>
          ) : (
            <>
              <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                {formatCurrency(stats?.avgCostPerSession ?? 0)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {text('按会话平均', 'Per session average')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className='relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full' />
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {text('最活跃项目', 'Most Active Project')}
          </CardTitle>
          <div className='rounded-full bg-red-500/10 p-2'>
            <FolderOpen className='h-4 w-4 text-red-500' />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className='h-8 w-24 mb-1' />
              <Skeleton className='h-4 w-20' />
            </>
          ) : (
            <>
              <div className='text-2xl font-bold text-red-600 dark:text-red-400 truncate'>
                {stats?.mostActiveProject
                  ? formatProjectName(
                      stats.mostActiveProject.project,
                      text('未知项目', 'Unknown Project')
                    )
                  : text('暂无', 'N/A')}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats?.mostActiveProject
                  ? `${stats.mostActiveProject.sessionCount} ${text('个会话', 'sessions')}`
                  : text('暂无数据', 'No data')}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
