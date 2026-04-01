import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useLocale } from '@/context/locale-provider'
import type { TokenBreakdown } from '@/lib/api'

interface TokenBreakdownCardProps {
  data: TokenBreakdown | undefined
}

interface TokenBarItem {
  label: string
  value: number
  percentage: number
  color: string
}

function formatTokenCount(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

export function TokenBreakdownCard({ data }: TokenBreakdownCardProps) {
  const { text } = useLocale()

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{text('Token 构成', 'Token Breakdown')}</CardTitle>
          <CardDescription>{text('最近 30 天', 'Last 30 days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[200px] items-center justify-center text-muted-foreground'>
            {text('加载中...', 'Loading...')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = data.input + data.output + data.cacheRead + data.cacheCreation

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{text('Token 构成', 'Token Breakdown')}</CardTitle>
          <CardDescription>{text('最近 30 天', 'Last 30 days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex h-[200px] items-center justify-center px-4 text-center text-muted-foreground'>
            {text(
              '暂无数据。开始使用 Claude Code 后，这里会显示你的 Token 使用情况。',
              'No data yet. Start using Claude Code to see your token usage here.'
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const items: TokenBarItem[] = [
    {
      label: text('输入', 'Input'),
      value: data.input,
      percentage: (data.input / total) * 100,
      color: '#ef4444',
    },
    {
      label: text('输出', 'Output'),
      value: data.output,
      percentage: (data.output / total) * 100,
      color: '#f43f5e',
    },
    {
      label: text('缓存读取', 'Cache (read)'),
      value: data.cacheRead,
      percentage: (data.cacheRead / total) * 100,
      color: '#10b981',
    },
    {
      label: text('缓存写入', 'Cache (write)'),
      value: data.cacheCreation,
      percentage: (data.cacheCreation / total) * 100,
      color: '#ec4899',
    },
  ].filter((item) => item.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text('Token 构成', 'Token Breakdown')}</CardTitle>
        <CardDescription>
          {text(
            `最近 30 天 · 共 ${formatTokenCount(total)} 个 Token`,
            `Last 30 days · ${formatTokenCount(total)} tokens total`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <div className='flex h-8 w-full overflow-hidden rounded-full'>
            {items.map((item, idx) => (
              <div
                key={idx}
                className='transition-all duration-300 first:rounded-l-full last:rounded-r-full'
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                title={`${item.label}: ${formatTokenCount(item.value)} (${item.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {items.map((item, idx) => (
            <div key={idx} className='flex items-center gap-3'>
              <div
                className='h-3 w-3 shrink-0 rounded-full'
                style={{ backgroundColor: item.color }}
              />
              <div className='min-w-0 flex-1'>
                <div className='flex items-baseline justify-between gap-2'>
                  <span className='truncate text-sm font-medium'>{item.label}</span>
                  <span className='shrink-0 tabular-nums text-sm text-muted-foreground'>
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className='font-mono text-xs text-muted-foreground'>
                  {formatTokenCount(item.value)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='space-y-3 border-t pt-2'>
          {items.map((item, idx) => (
            <div key={idx} className='space-y-1.5'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>{item.label}</span>
                <span className='font-mono text-muted-foreground'>
                  {formatTokenCount(item.value)}
                </span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full transition-all duration-500'
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
