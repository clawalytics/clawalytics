import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLocale } from '@/context/locale-provider'
import type { Channel } from '@/lib/api'

interface ChannelComparisonChartProps {
  channels: Channel[]
}

const BAR_COLORS = [
  '#7f1d1d',
  '#991b1b',
  '#b91c1c',
  '#dc2626',
  '#ef4444',
  '#f87171',
  '#fca5a5',
  '#fecaca',
  '#fee2e2',
  '#fef2f2',
]

function getBarColor(index: number, total: number): string {
  const colorIndex = Math.min(
    Math.floor((index / total) * BAR_COLORS.length),
    BAR_COLORS.length - 1
  )
  return BAR_COLORS[colorIndex]
}

interface CustomTickProps {
  x?: number | string
  y?: number | string
  payload?: { value: string }
}

function CustomYAxisTick({ x, y, payload }: CustomTickProps) {
  if (!payload) return null

  return (
    <text
      x={Number(x)}
      y={Number(y)}
      dy={4}
      textAnchor='end'
      fill='hsl(var(--foreground))'
      style={{ fontFamily: '"Jersey 10", sans-serif', fontSize: '14px' }}
    >
      {payload.value}
    </text>
  )
}

export function ChannelComparisonChart({
  channels,
}: ChannelComparisonChartProps) {
  const { locale, text } = useLocale()
  const numberLocale = locale === 'zh' ? 'zh-CN' : 'en-US'

  const chartData = channels
    .filter((channel) => channel.total_cost > 0 || channel.message_count > 0)
    .sort((a, b) => b.total_cost - a.total_cost)
    .map((channel) => ({
      name: channel.name.toUpperCase(),
      cost: channel.total_cost,
      messages: channel.message_count,
      inputTokens: channel.total_input_tokens,
      outputTokens: channel.total_output_tokens,
    }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center px-4 text-center text-muted-foreground'>
        {text(
          '暂无数据。消息处理后，这里会显示渠道成本。',
          'No data yet. Channel costs will appear here once messages are processed.'
        )}
      </div>
    )
  }

  const chartHeight = Math.max(200, chartData.length * 28 + 40)

  return (
    <ResponsiveContainer width='100%' height={chartHeight}>
      <BarChart
        data={chartData}
        layout='vertical'
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray='3 3'
          horizontal
          vertical={false}
          stroke='hsl(var(--border))'
        />
        <XAxis
          type='number'
          stroke='hsl(var(--muted-foreground))'
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `$${value.toFixed(2)}`}
        />
        <YAxis
          type='category'
          dataKey='name'
          tickLine={false}
          axisLine={false}
          width={130}
          interval={0}
          tick={CustomYAxisTick}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload as (typeof chartData)[0]

              return (
                <div className='min-w-[180px] rounded-lg border bg-background p-3 shadow-md'>
                  <div className='mb-2 font-jersey text-base'>{item.name}</div>
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-xs text-muted-foreground'>
                        {text('成本', 'Cost')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        ${item.cost.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-xs text-muted-foreground'>
                        {text('消息数', 'Messages')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {item.messages.toLocaleString(numberLocale)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-4 border-t pt-1.5 text-xs text-muted-foreground'>
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
        <Bar dataKey='cost' radius={[0, 4, 4, 0]} maxBarSize={22}>
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(index, chartData.length)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

ChannelComparisonChart.displayName = 'ChannelComparisonChart'
