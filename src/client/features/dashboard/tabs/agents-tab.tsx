import { useQuery } from '@tanstack/react-query'
import { Activity, Bot, Coins, DollarSign, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import { AgentCostChart } from '@/features/agents/components/agent-cost-chart'
import { AgentDistributionChart } from '@/features/agents/components/agent-distribution-chart'
import { AgentsTable } from '@/features/agents/components/agents-table'
import { getAgentStats, getAllAgentsDailyCosts } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/format'

interface AgentsTabProps {
  enabled: boolean
}

export function AgentsTab({ enabled }: AgentsTabProps) {
  const { text } = useLocale()

  const { data: agentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['agentStats'],
    queryFn: () => getAgentStats(50),
    refetchInterval: 10000,
    enabled,
  })

  const { data: dailyCosts, isLoading: dailyCostsLoading } = useQuery({
    queryKey: ['agentDailyCosts'],
    queryFn: () => getAllAgentsDailyCosts(30),
    refetchInterval: 10000,
    enabled,
  })

  const agents = agentStats?.agents ?? []
  const totalInputTokens = agents.reduce(
    (acc, agent) => acc + agent.total_input_tokens,
    0
  )
  const totalOutputTokens = agents.reduce(
    (acc, agent) => acc + agent.total_output_tokens,
    0
  )

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('代理总成本', 'Total Agent Cost')}
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
                  {formatCurrency(agentStats?.totalCost ?? 0)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text('所有代理合计', 'Across all agents')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-rose-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('代理数量', 'Agents')}
            </CardTitle>
            <div className='rounded-full bg-rose-500/10 p-2'>
              <Bot className='h-4 w-4 text-rose-500' />
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
                  {agents.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text('已注册代理', 'Registered agents')}
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
            {statsLoading ? (
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
              {text('总会话数', 'Total Sessions')}
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
                  {agentStats?.totalSessions ?? 0}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text('全部代理会话', 'Across all agents')}
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
              <TrendingUp className='h-5 w-5' />
              {text('每日成本', 'Daily Cost')}
            </CardTitle>
            <CardDescription>
              {text('最近 30 天的代理成本', 'Agent costs over the last 30 days')}
            </CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            {dailyCostsLoading ? (
              <Skeleton className='h-[300px] w-full' />
            ) : (
              <AgentCostChart data={dailyCosts ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>{text('成本分布', 'Cost Distribution')}</CardTitle>
            <CardDescription>
              {text('按代理查看成本', 'View costs by agent')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className='h-[300px] w-full' />
            ) : (
              <AgentDistributionChart agents={agents} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{text('全部代理', 'All Agents')}</CardTitle>
          <CardDescription>
            {text('所有已注册的 OpenClaw 代理', 'All registered OpenClaw agents')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          ) : (
            <AgentsTable agents={agents} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
