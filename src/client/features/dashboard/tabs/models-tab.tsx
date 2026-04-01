import { useQuery } from '@tanstack/react-query'
import { Building2, Coins, DollarSign, Layers } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import { ModelCostChart } from '@/features/models/components/model-cost-chart'
import { ModelsTable } from '@/features/models/components/models-table'
import { ProviderDistributionChart } from '@/features/models/components/provider-distribution-chart'
import {
  getModelDailyUsage,
  getModels,
  getModelStats,
  getProviderSummary,
} from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/format'

interface ModelsTabProps {
  enabled: boolean
}

export function ModelsTab({ enabled }: ModelsTabProps) {
  const { text } = useLocale()

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: () => getModels(30),
    refetchInterval: 10000,
    enabled,
  })

  const { data: modelStats, isLoading: statsLoading } = useQuery({
    queryKey: ['modelStats'],
    queryFn: () => getModelStats(30),
    refetchInterval: 10000,
    enabled,
  })

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => getProviderSummary(30),
    refetchInterval: 10000,
    enabled,
  })

  const { data: dailyUsage, isLoading: dailyLoading } = useQuery({
    queryKey: ['modelDailyUsage'],
    queryFn: () => getModelDailyUsage(30),
    refetchInterval: 10000,
    enabled,
  })

  const totalCost = models?.reduce((acc, model) => acc + model.cost, 0) ?? 0
  const totalInputTokens =
    models?.reduce((acc, model) => acc + model.inputTokens, 0) ?? 0
  const totalOutputTokens =
    models?.reduce((acc, model) => acc + model.outputTokens, 0) ?? 0

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('模型总成本', 'Total Model Cost')}
            </CardTitle>
            <div className='rounded-full bg-red-500/10 p-2'>
              <DollarSign className='h-4 w-4 text-red-500' />
            </div>
          </CardHeader>
          <CardContent>
            {modelsLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-24' />
                <Skeleton className='h-4 w-32' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {formatCurrency(totalCost)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text('最近 30 天', 'Last 30 days')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-rose-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('已使用模型', 'Models Used')}
            </CardTitle>
            <div className='rounded-full bg-rose-500/10 p-2'>
              <Layers className='h-4 w-4 text-rose-500' />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-16' />
                <Skeleton className='h-4 w-24' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-rose-600 dark:text-rose-400'>
                  {modelStats?.totalModels ?? 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text(
                    `来自 ${modelStats?.totalProviders ?? 0} 个提供商`,
                    `${modelStats?.totalProviders ?? 0} providers`
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('总 Token 数', 'Total Tokens')}
            </CardTitle>
            <div className='rounded-full bg-red-500/10 p-2'>
              <Coins className='h-4 w-4 text-red-500' />
            </div>
          </CardHeader>
          <CardContent>
            {modelsLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-24' />
                <Skeleton className='h-4 w-32' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {formatNumber(totalInputTokens + totalOutputTokens)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text(
                    `输入 ${formatNumber(totalInputTokens)} / 输出 ${formatNumber(totalOutputTokens)}`,
                    `In ${formatNumber(totalInputTokens)} / Out ${formatNumber(totalOutputTokens)}`
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('主要提供商', 'Top Provider')}
            </CardTitle>
            <div className='rounded-full bg-red-500/10 p-2'>
              <Building2 className='h-4 w-4 text-red-500' />
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-24' />
                <Skeleton className='h-4 w-32' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold capitalize text-red-600 dark:text-red-400'>
                  {modelStats?.topProvider?.provider ?? text('暂无', 'None')}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {modelStats?.topProvider
                    ? text(
                        `${formatCurrency(modelStats.topProvider.cost)}（${modelStats.topProvider.modelCount} 个模型）`,
                        `${formatCurrency(modelStats.topProvider.cost)} (${modelStats.topProvider.modelCount} models)`
                      )
                    : text('暂无数据', 'No data')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              {text('按模型查看每日成本', 'Daily Cost by Model')}
            </CardTitle>
            <CardDescription>
              {text('最近 30 天的模型成本', 'Model costs over the last 30 days')}
            </CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            {dailyLoading ? (
              <Skeleton className='h-[300px] w-full' />
            ) : (
              <ModelCostChart data={dailyUsage ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>{text('提供商成本分布', 'Provider Cost Split')}</CardTitle>
            <CardDescription>
              {text('不同提供商的成本占比', 'Cost share across providers')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {providersLoading ? (
              <Skeleton className='h-[300px] w-full' />
            ) : (
              <ProviderDistributionChart providers={providers ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{text('全部模型', 'All Models')}</CardTitle>
          <CardDescription>
            {text(
              '最近 30 天所有模型的使用情况与成本',
              'Usage and costs for all models over the last 30 days'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          ) : (
            <ModelsTable models={models ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
