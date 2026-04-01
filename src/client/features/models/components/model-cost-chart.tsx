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
import type { ModelDailyUsage } from '@/lib/api'

interface ModelCostChartProps {
  data: ModelDailyUsage[]
}

export function ModelCostChart({ data }: ModelCostChartProps) {
  const { locale, text } = useLocale()
  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US'

  const aggregatedByDate = data.reduce(
    (acc, item) => {
      const existing = acc.get(item.date)
      if (existing) {
        existing.cost += item.cost
        existing.inputTokens += item.inputTokens
        existing.outputTokens += item.outputTokens
        existing.requestCount += item.requestCount
      } else {
        acc.set(item.date, {
          date: item.date,
          cost: item.cost,
          inputTokens: item.inputTokens,
          outputTokens: item.outputTokens,
          requestCount: item.requestCount,
        })
      }
      return acc
    },
    new Map<
      string,
      {
        date: string
        cost: number
        inputTokens: number
        outputTokens: number
        requestCount: number
      }
    >()
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
      cost: item.cost,
      requests: item.requestCount,
      inputTokens: item.inputTokens,
      outputTokens: item.outputTokens,
    }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
        {text(
          '暂无数据。模型开始使用后，这里会显示成本走势。',
          'No data yet. Costs will appear here once models are used.'
        )}
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id='modelCostGradient' x1='0' y1='0' x2='0' y2='1'>
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
          fill='url(#modelCostGradient)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

ModelCostChart.displayName = 'ModelCostChart'
