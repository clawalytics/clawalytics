import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import type { ModelUsage, TokenBreakdown } from '@/lib/api'
import { ModelUsageChart } from '../components/model-usage-chart'
import { TokenBreakdownCard } from '../components/token-breakdown-card'
import { TopModelsTable } from '../components/top-models-table'

interface OverviewTabProps {
  modelUsage: ModelUsage[] | undefined
  modelUsageLoading: boolean
  tokenBreakdown: TokenBreakdown | undefined
  tokenBreakdownLoading: boolean
  onSwitchTab: (tab: string) => void
}

export function OverviewTab({
  modelUsage,
  modelUsageLoading,
  tokenBreakdown,
  tokenBreakdownLoading,
  onSwitchTab,
}: OverviewTabProps) {
  const { text } = useLocale()

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
      <Card className='col-span-1 lg:col-span-3'>
        <CardHeader>
          <CardTitle>{text('模型使用情况', 'Model Usage')}</CardTitle>
          <CardDescription>
            {text('按模型查看成本分布', 'View cost distribution by model')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modelUsageLoading ? (
            <Skeleton className='h-[300px] w-full' />
          ) : (
            <ModelUsageChart data={modelUsage ?? []} />
          )}
        </CardContent>
      </Card>

      <div className='col-span-1 space-y-6 lg:col-span-4'>
        {tokenBreakdownLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-48' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-[200px] w-full' />
            </CardContent>
          </Card>
        ) : (
          <TokenBreakdownCard data={tokenBreakdown} />
        )}

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle>{text('热门模型', 'Top Models')}</CardTitle>
              <CardDescription>
                {text('按成本排序的常用模型', 'Most-used models by cost')}
              </CardDescription>
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1'
              onClick={() => onSwitchTab('models')}
            >
              {text('查看全部', 'View All')}
              <ArrowRight className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent>
            {modelUsageLoading ? (
              <div className='space-y-4'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='flex items-center gap-4'>
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </div>
            ) : (
              <TopModelsTable models={modelUsage ?? []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
