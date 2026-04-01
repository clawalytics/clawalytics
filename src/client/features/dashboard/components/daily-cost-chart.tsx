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
import type { DailyCost } from '@/lib/api'

interface DailyCostChartProps {
  data: DailyCost[]
}

export function DailyCostChart({ data }: DailyCostChartProps) {
  const { locale, text } = useLocale()
  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US'

  const chartData = data.map((item) => ({
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
    sessions: item.session_count,
    cacheSavings: item.cache_savings,
  }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
        {text(
          '暂无数据。开始使用 Claude Code 后，这里会显示你的成本走势。',
          'No data yet. Start using Claude Code to see your costs here.'
        )}
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id='colorCostGradient' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='#fca5a5' stopOpacity={1} />
            <stop offset='40%' stopColor='#ef4444' stopOpacity={1} />
            <stop offset='100%' stopColor='#b91c1c' stopOpacity={1} />
          </linearGradient>
          <linearGradient id='colorCostStroke' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='#f87171' />
            <stop offset='50%' stopColor='#dc2626' />
            <stop offset='100%' stopColor='#991b1b' />
          </linearGradient>
          <linearGradient id='colorSavingsGradient' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='#86efac' stopOpacity={1} />
            <stop offset='40%' stopColor='#22c55e' stopOpacity={1} />
            <stop offset='100%' stopColor='#15803d' stopOpacity={1} />
          </linearGradient>
          <linearGradient id='colorSavingsStroke' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='#4ade80' />
            <stop offset='50%' stopColor='#16a34a' />
            <stop offset='100%' stopColor='#166534' />
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
              const tooltipData = payload[0].payload as (typeof chartData)[0]

              return (
                <div className='rounded-lg border bg-background p-3 shadow-md'>
                  <div className='mb-2 text-sm font-medium'>
                    {tooltipData.fullDate}
                  </div>
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between gap-6'>
                      <span className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span className='h-2 w-2 rounded-full bg-red-500' />
                        {text('成本', 'Cost')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        ${tooltipData.cost.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-6'>
                      <span className='text-xs text-muted-foreground'>
                        {text('请求数', 'Requests')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {tooltipData.requests}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-6'>
                      <span className='text-xs text-muted-foreground'>
                        {text('会话数', 'Sessions')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {tooltipData.sessions}
                      </span>
                    </div>
                    {tooltipData.cacheSavings > 0 && (
                      <div className='flex items-center justify-between gap-6 border-t pt-1.5'>
                        <span className='flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400'>
                          <span className='h-2 w-2 rounded-full bg-emerald-500' />
                          {text('缓存节省', 'Cache Savings')}
                        </span>
                        <span className='font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400'>
                          ${tooltipData.cacheSavings.toFixed(4)}
                        </span>
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
          type='step'
          dataKey='cost'
          stroke='url(#colorCostStroke)'
          strokeWidth={3}
          fillOpacity={1}
          fill='url(#colorCostGradient)'
        />
        <Area
          type='step'
          dataKey='cacheSavings'
          stroke='url(#colorSavingsStroke)'
          strokeWidth={2}
          fillOpacity={1}
          fill='url(#colorSavingsGradient)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
