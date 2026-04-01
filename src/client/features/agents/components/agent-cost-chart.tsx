import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLocale } from '@/context/locale-provider'
import type { AgentDailyCost } from '@/lib/api'

interface AgentCostChartProps {
  data: AgentDailyCost[]
}

export function AgentCostChart({ data }: AgentCostChartProps) {
  const { locale, text } = useLocale()
  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US'

  const aggregatedByDate = data.reduce(
    (acc, item) => {
      const existing = acc.get(item.date)
      if (existing) {
        existing.total_cost += item.total_cost
        existing.input_tokens += item.input_tokens
        existing.output_tokens += item.output_tokens
        existing.cache_read_tokens += item.cache_read_tokens
        existing.cache_creation_tokens += item.cache_creation_tokens
        existing.request_count += item.request_count
      } else {
        acc.set(item.date, { ...item })
      }
      return acc
    },
    new Map<string, AgentDailyCost>()
  )

  const chartData = Array.from(aggregatedByDate.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
      }),
      fullDate: new Date(item.date).toLocaleDateString(dateLocale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      cost: item.total_cost,
      requests: item.request_count,
      inputTokens: item.input_tokens,
      outputTokens: item.output_tokens,
      cacheReadTokens: item.cache_read_tokens,
      cacheCreationTokens: item.cache_creation_tokens,
    }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
        {text(
          '暂无数据。代理活跃后，这里会显示成本走势。',
          'No data yet. Costs will appear here once agents are active.'
        )}
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id='agentCostGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#ef4444' stopOpacity={0.5} />
            <stop offset='50%' stopColor='#f87171' stopOpacity={0.25} />
            <stop offset='95%' stopColor='#fca5a5' stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='hsl(var(--border))'
        />
        <XAxis
          dataKey='date'
          stroke='hsl(var(--muted-foreground))'
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval='preserveStartEnd'
        />
        <YAxis
          stroke='hsl(var(--muted-foreground))'
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value: number) => `$${value.toFixed(2)}`}
          width={55}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload as (typeof chartData)[0]

              return (
                <div className='rounded-lg border bg-background p-3 shadow-md'>
                  <div className='mb-2 text-sm font-medium'>{item.fullDate}</div>
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between gap-6'>
                      <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span className='h-2 w-2 rounded-full bg-red-500' />
                        {text('成本', 'Cost')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        ${item.cost.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-6'>
                      <span className='text-xs text-muted-foreground'>
                        {text('请求数', 'Requests')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {item.requests}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-6 border-t pt-1.5 text-xs text-muted-foreground'>
                      <span>
                        {(item.inputTokens / 1000).toFixed(1)}K {text('输入', 'in')}
                      </span>
                      <span>
                        {(item.outputTokens / 1000).toFixed(1)}K {text('输出', 'out')}
                      </span>
                    </div>
                    {(item.cacheReadTokens > 0 || item.cacheCreationTokens > 0) && (
                      <div className='flex items-center justify-between gap-6 text-xs text-green-600 dark:text-green-400'>
                        <span>{text('缓存读取：', 'Cache read:')}</span>
                        <span>{(item.cacheReadTokens / 1000).toFixed(1)}K</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            return null
          }}
        />
        <Area
          type='monotone'
          dataKey='cost'
          stroke='#ef4444'
          strokeWidth={2.5}
          fillOpacity={1}
          fill='url(#agentCostGradient)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

AgentCostChart.displayName = 'AgentCostChart'
