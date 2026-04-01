import { X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/context/locale-provider'
import type { ProjectBreakdown } from '@/lib/api'

interface ProjectCostChartProps {
  data: ProjectBreakdown[]
  activeProject: string | undefined
  onProjectClick: (project: string) => void
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

function formatProjectName(path: string | undefined, fallback: string): string {
  const value = path?.trim()
  if (!value) return fallback

  const parts = value.split('-')
  return (parts[parts.length - 1] || value).toUpperCase()
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

export function ProjectCostChart({
  data,
  activeProject,
  onProjectClick,
}: ProjectCostChartProps) {
  const { locale, text } = useLocale()
  const numberLocale = locale === 'zh' ? 'zh-CN' : 'en-US'
  const unknownProjectLabel = text('未知项目', 'Unknown Project')

  const chartData = data
    .filter((item) => item.totalCost > 0 || item.sessionCount > 0)
    .map((item) => ({
      name: formatProjectName(item.project, unknownProjectLabel),
      project: item.project,
      cost: item.totalCost,
      sessions: item.sessionCount,
      inputTokens: item.totalInputTokens,
      outputTokens: item.totalOutputTokens,
    }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[200px] items-center justify-center px-4 text-center text-muted-foreground'>
        {text('暂无项目数据。', 'No project data available yet.')}
      </div>
    )
  }

  const chartHeight = Math.max(200, chartData.length * 28 + 40)

  return (
    <div>
      {activeProject && (
        <div className='mb-3 flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            {text('按项目筛选：', 'Filtered by:')}
          </span>
          <Badge
            variant='secondary'
            className='cursor-pointer gap-1'
            onClick={() => onProjectClick(activeProject)}
          >
            {formatProjectName(activeProject, unknownProjectLabel)}
            <X className='h-3 w-3' />
          </Badge>
        </div>
      )}
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
                          {text('会话', 'Sessions')}
                        </span>
                        <span className='font-mono text-sm font-medium'>
                          {item.sessions.toLocaleString(numberLocale)}
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
          <Bar
            dataKey='cost'
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            cursor='pointer'
            onClick={(_entry, index) => {
              if (typeof index === 'number' && chartData[index]) {
                onProjectClick(chartData[index].project)
              }
            }}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(index, chartData.length)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
