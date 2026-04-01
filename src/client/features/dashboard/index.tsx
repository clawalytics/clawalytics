import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Coins,
  Database,
  DollarSign,
  Download,
  TrendingUp,
} from 'lucide-react'
import { HomeIcon } from '@/components/icons/home-icon'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocale } from '@/context/locale-provider'
import {
  getBudgetStatus,
  getDailyCosts,
  getEnhancedStats,
  getModelUsage,
  getTokenBreakdown,
  type BudgetPeriod,
} from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/format'
import { DailyCostChart } from './components/daily-cost-chart'
import { AgentsTab } from './tabs/agents-tab'
import { ChannelsTab } from './tabs/channels-tab'
import { ModelsTab } from './tabs/models-tab'
import { OverviewTab } from './tabs/overview-tab'

export function Dashboard() {
  const { locale, text } = useLocale()
  const [activeTab, setActiveTab] = useState('overview')
  const visitedTabs = useRef(new Set(['overview']))
  const numberLocale = locale === 'zh' ? 'zh-CN' : 'en-US'

  const handleTabChange = (tab: string) => {
    visitedTabs.current.add(tab)
    setActiveTab(tab)
  }

  const hasVisited = (tab: string) => visitedTabs.current.has(tab)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['enhancedStats'],
    queryFn: getEnhancedStats,
    refetchInterval: 5000,
  })

  const { data: dailyCosts, isLoading: dailyCostsLoading } = useQuery({
    queryKey: ['dailyCosts'],
    queryFn: () => getDailyCosts(30),
    refetchInterval: 10000,
  })

  const { data: modelUsage, isLoading: modelUsageLoading } = useQuery({
    queryKey: ['modelUsage'],
    queryFn: () => getModelUsage(30),
    refetchInterval: 10000,
  })

  const { data: tokenBreakdown, isLoading: tokenBreakdownLoading } = useQuery({
    queryKey: ['tokenBreakdown'],
    queryFn: () => getTokenBreakdown(30),
    refetchInterval: 10000,
  })

  const { data: budgetStatus } = useQuery({
    queryKey: ['budgetStatus'],
    queryFn: getBudgetStatus,
    refetchInterval: 10000,
  })

  const totalTokens = stats
    ? stats.totalTokens.input +
      stats.totalTokens.output +
      stats.totalTokens.cacheRead +
      stats.totalTokens.cacheCreation
    : 0

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <HomeIcon active className='h-6 w-6' />
          <span className='font-jersey text-xl'>
            {text('仪表盘', 'Dashboard')}
          </span>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {text('概览', 'Overview')}
            </h1>
            <p className='text-muted-foreground'>
              {text(
                '一眼掌握你的成本分析概况',
                'Your cost analytics at a glance'
              )}
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.open('/api/export/costs?format=csv', '_blank')}
          >
            <Download className='mr-2 h-4 w-4' />
            {text('导出 CSV', 'Export CSV')}
          </Button>
        </div>

        <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('总成本', 'Total Cost')}
              </CardTitle>
              <div className='rounded-full bg-red-500/10 p-2'>
                <DollarSign className='h-4 w-4 text-red-500' />
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
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {formatCurrency(stats?.totalCost ?? 0)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('本月', 'This month')} {formatCurrency(stats?.monthCost ?? 0)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-rose-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('总 Token 数', 'Total Tokens')}
              </CardTitle>
              <div className='rounded-full bg-rose-500/10 p-2'>
                <Coins className='h-4 w-4 text-rose-500' />
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='cursor-help text-2xl font-bold text-rose-600 dark:text-rose-400'>
                        {formatNumber(totalTokens)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='text-sm'>
                      <div className='space-y-1'>
                        <div className='flex justify-between gap-4'>
                          <span>{text('输入：', 'In:')}</span>
                          <span className='font-mono'>
                            {(stats?.totalTokens.input ?? 0).toLocaleString(
                              numberLocale
                            )}
                          </span>
                        </div>
                        <div className='flex justify-between gap-4'>
                          <span>{text('输出：', 'Out:')}</span>
                          <span className='font-mono'>
                            {(stats?.totalTokens.output ?? 0).toLocaleString(
                              numberLocale
                            )}
                          </span>
                        </div>
                        <div className='flex justify-between gap-4'>
                          <span>{text('缓存读取：', 'Cache Read:')}</span>
                          <span className='font-mono'>
                            {(stats?.totalTokens.cacheRead ?? 0).toLocaleString(
                              numberLocale
                            )}
                          </span>
                        </div>
                        <div className='flex justify-between gap-4'>
                          <span>{text('缓存写入：', 'Cache Write:')}</span>
                          <span className='font-mono'>
                            {(
                              stats?.totalTokens.cacheCreation ?? 0
                            ).toLocaleString(numberLocale)}
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <p className='text-xs text-muted-foreground'>
                    {text(
                      `输入 ${formatNumber(stats?.totalTokens.input ?? 0)} / 输出 ${formatNumber(stats?.totalTokens.output ?? 0)}`,
                      `In ${formatNumber(stats?.totalTokens.input ?? 0)} / Out ${formatNumber(stats?.totalTokens.output ?? 0)}`
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
                {text('缓存节省', 'Cache Savings')}
              </CardTitle>
              <div className='rounded-full bg-red-500/10 p-2'>
                <Database className='h-4 w-4 text-red-500' />
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
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {formatCurrency(stats?.cacheSavings ?? 0)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('通过提示缓存节省', 'Saved via prompt caching')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('活跃会话', 'Active Sessions')}
              </CardTitle>
              <div className='rounded-full bg-red-500/10 p-2'>
                <Activity className='h-4 w-4 text-red-500' />
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
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {stats?.activeSessionsThisMonth ?? 0}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('本月', 'This month')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {budgetStatus &&
          (budgetStatus.daily || budgetStatus.weekly || budgetStatus.monthly) && (
            <div className='mb-6 grid gap-4 sm:grid-cols-3'>
              {budgetStatus.daily && (
                <BudgetBar
                  label={text('日预算', 'Daily Budget')}
                  period={budgetStatus.daily}
                />
              )}
              {budgetStatus.weekly && (
                <BudgetBar
                  label={text('周预算', 'Weekly Budget')}
                  period={budgetStatus.weekly}
                />
              )}
              {budgetStatus.monthly && (
                <BudgetBar
                  label={text('月预算', 'Monthly Budget')}
                  period={budgetStatus.monthly}
                />
              )}
            </div>
          )}

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              {text('每日成本', 'Daily Cost')}
            </CardTitle>
            <CardDescription>
              {text(
                '最近 30 天的花费趋势',
                'Cost trend over the last 30 days'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            {dailyCostsLoading ? (
              <Skeleton className='h-[300px] w-full' />
            ) : (
              <DailyCostChart data={dailyCosts ?? []} />
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value='overview'>{text('概览', 'Overview')}</TabsTrigger>
            <TabsTrigger value='models'>{text('模型', 'Models')}</TabsTrigger>
            <TabsTrigger value='agents'>{text('代理', 'Agents')}</TabsTrigger>
            <TabsTrigger value='channels'>{text('渠道', 'Channels')}</TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <OverviewTab
              modelUsage={modelUsage}
              modelUsageLoading={modelUsageLoading}
              tokenBreakdown={tokenBreakdown}
              tokenBreakdownLoading={tokenBreakdownLoading}
              onSwitchTab={handleTabChange}
            />
          </TabsContent>

          <TabsContent value='models'>
            <ModelsTab enabled={hasVisited('models')} />
          </TabsContent>

          <TabsContent value='agents'>
            <AgentsTab enabled={hasVisited('agents')} />
          </TabsContent>

          <TabsContent value='channels'>
            <ChannelsTab enabled={hasVisited('channels')} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

function BudgetBar({
  label,
  period,
}: {
  label: string
  period: BudgetPeriod
}) {
  const { text } = useLocale()

  const color =
    period.percent >= 90
      ? 'bg-red-500'
      : period.percent >= 70
        ? 'bg-yellow-500'
        : 'bg-green-500'

  const textColor =
    period.percent >= 90
      ? 'text-red-600 dark:text-red-400'
      : period.percent >= 70
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-green-600 dark:text-green-400'

  return (
    <Card className='p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm font-medium'>{label}</span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {formatCurrency(period.spent)} / {formatCurrency(period.budget)}
        </span>
      </div>
      <div className='relative h-2 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className={`h-full transition-all ${color}`}
          style={{ width: `${Math.min(100, period.percent)}%` }}
        />
      </div>
      <p className='mt-1 text-xs text-muted-foreground'>
        {text(
          `已使用 ${period.percent.toFixed(0)}%`,
          `Used ${period.percent.toFixed(0)}%`
        )}
      </p>
    </Card>
  )
}
