import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useLocale } from '@/context/locale-provider'
import type { ProviderSummary } from '@/lib/api'

interface ProviderDistributionChartProps {
  providers: ProviderSummary[]
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
]

export function ProviderDistributionChart({
  providers,
}: ProviderDistributionChartProps) {
  const { text } = useLocale()
  const totalCost = providers.reduce((acc, provider) => acc + provider.totalCost, 0)

  const chartData = providers
    .filter((provider) => provider.totalCost > 0)
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 6)
    .map((provider, idx) => ({
      name:
        provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
      value: provider.totalCost,
      percentage: totalCost > 0 ? (provider.totalCost / totalCost) * 100 : 0,
      fill: COLORS[idx % COLORS.length],
      modelCount: provider.modelCount,
      requestCount: provider.requestCount,
      inputTokens: provider.totalInputTokens,
      outputTokens: provider.totalOutputTokens,
    }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center px-4 text-center text-muted-foreground'>
        {text(
          '暂无数据。开始使用模型后，这里会显示提供商分布。',
          'No data yet. The distribution will appear once models are used.'
        )}
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='45%'
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey='value'
          nameKey='name'
          strokeWidth={2}
          stroke='hsl(var(--background))'
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload as (typeof chartData)[0]

              return (
                <div className='min-w-[180px] rounded-lg border bg-background p-3 shadow-md'>
                  <div className='mb-2 max-w-[200px] truncate text-sm font-medium'>
                    {item.name}
                  </div>
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-xs text-muted-foreground'>
                        {text('成本', 'Cost')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        ${item.value.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-xs text-muted-foreground'>
                        {text('占比', 'Share')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-xs text-muted-foreground'>
                        {text('模型数', 'Models')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {item.modelCount}
                      </span>
                    </div>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-xs text-muted-foreground'>
                        {text('请求数', 'Requests')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {item.requestCount}
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
        <Legend
          verticalAlign='bottom'
          height={36}
          iconType='circle'
          iconSize={8}
          formatter={(value: string) => (
            <span className='text-xs text-muted-foreground'>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

ProviderDistributionChart.displayName = 'ProviderDistributionChart'
