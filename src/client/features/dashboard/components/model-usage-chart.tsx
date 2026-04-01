import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'
import { useLocale } from '@/context/locale-provider'
import type { ModelUsage } from '@/lib/api'

interface ModelUsageChartProps {
  data: ModelUsage[]
}

const COLORS = [
  '#dc2626',
  '#2563eb',
  '#d946ef',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#f43f5e',
  '#06b6d4',
]

function getModelShortName(model: string): string {
  if (model.includes('claude-opus-4')) return 'Opus 4'
  if (model.includes('claude-opus')) return 'Opus'
  if (model.includes('claude-sonnet-4')) return 'Sonnet 4'
  if (model.includes('claude-sonnet')) return 'Sonnet'
  if (model.includes('claude-haiku')) return 'Haiku'
  if (model.includes('gpt-4o-mini')) return '4o-mini'
  if (model.includes('gpt-4o')) return 'GPT-4o'
  if (model.includes('gpt-4')) return 'GPT-4'
  if (model.includes('gemini')) return 'Gemini'
  if (model.includes('deepseek')) return 'DeepSeek'
  const lastSegment = model.split('/').pop() || model
  return lastSegment.length > 12 ? lastSegment.substring(0, 12) : lastSegment
}

interface TreemapContentProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  percentage: number
  fill: string
}

function CustomTreemapContent({
  x,
  y,
  width,
  height,
  name,
  percentage,
  fill,
}: TreemapContentProps) {
  const showLabel = width > 40 && height > 30

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke='hsl(var(--background))'
        strokeWidth={3}
        rx={4}
        className='cursor-pointer transition-opacity hover:opacity-80'
      />
      {showLabel && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - (height > 50 ? 6 : 0)}
            textAnchor='middle'
            dominantBaseline='central'
            fill='white'
            fontSize={width > 80 ? 13 : 11}
            fontWeight={600}
          >
            {name}
          </text>
          {height > 50 && width > 55 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 14}
              textAnchor='middle'
              dominantBaseline='central'
              fill='rgba(255,255,255,0.8)'
              fontSize={11}
            >
              {percentage.toFixed(1)}%
            </text>
          )}
        </>
      )}
    </g>
  )
}

export function ModelUsageChart({ data }: ModelUsageChartProps) {
  const { text } = useLocale()
  const totalCost = data.reduce((acc, item) => acc + item.cost, 0)

  const chartData = data
    .filter((item) => item.cost > 0)
    .slice(0, 8)
    .map((item, idx) => ({
      name: getModelShortName(item.model),
      fullName: `${item.provider}/${item.model}`,
      size: item.cost,
      percentage: totalCost > 0 ? (item.cost / totalCost) * 100 : 0,
      fill: COLORS[idx % COLORS.length],
      requests: item.request_count,
      inputTokens: item.input_tokens,
      outputTokens: item.output_tokens,
    }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center px-4 text-center text-muted-foreground'>
        {text(
          '暂无数据。开始使用 Claude Code 后，这里会显示模型使用情况。',
          'No data yet. Start using Claude Code to see your model usage here.'
        )}
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <Treemap
        data={chartData}
        dataKey='size'
        aspectRatio={4 / 3}
        content={
          <CustomTreemapContent
            x={0}
            y={0}
            width={0}
            height={0}
            name=''
            percentage={0}
            fill=''
          />
        }
      >
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload as (typeof chartData)[0]

              return (
                <div className='min-w-[180px] rounded-lg border bg-background p-3 shadow-md'>
                  <div className='mb-2 flex max-w-[200px] items-center gap-2 truncate text-sm font-medium'>
                    <span
                      className='h-3 w-3 shrink-0 rounded'
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.fullName}
                  </div>
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-xs text-muted-foreground'>
                        {text('成本', 'Cost')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        ${item.size.toFixed(4)}
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
                        {text('请求数', 'Requests')}
                      </span>
                      <span className='font-mono text-sm font-medium'>
                        {item.requests}
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
      </Treemap>
    </ResponsiveContainer>
  )
}
