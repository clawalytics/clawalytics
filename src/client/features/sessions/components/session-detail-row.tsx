import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import { getSessionRequests, type SessionRequest } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/format'

interface SessionDetailRowProps {
  sessionId: string
}

interface ModelBreakdown {
  model: string
  cost: number
  count: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
}

function toFiniteNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function getModelShortName(model: string | undefined, fallback: string): string {
  if (!model?.trim()) return fallback
  if (model.includes('claude-opus-4')) return 'Opus 4'
  if (model.includes('claude-opus')) return 'Opus'
  if (model.includes('claude-sonnet-4')) return 'Sonnet 4'
  if (model.includes('claude-sonnet')) return 'Sonnet'
  if (model.includes('claude-haiku')) return 'Haiku'
  if (model.includes('gpt-4o-mini')) return '4o-mini'
  if (model.includes('gpt-4o')) return 'GPT-4o'
  if (model.includes('gpt-4')) return 'GPT-4'
  return model.split('-')[0]
}

function aggregateByModel(requests: SessionRequest[]): ModelBreakdown[] {
  const map = new Map<string, ModelBreakdown>()
  for (const r of requests) {
    const model = r.model?.trim() || 'unknown'
    const existing = map.get(model)
    if (existing) {
      existing.cost += toFiniteNumber(r.cost)
      existing.count += 1
      existing.inputTokens += toFiniteNumber(r.input_tokens)
      existing.outputTokens += toFiniteNumber(r.output_tokens)
      existing.cacheReadTokens += toFiniteNumber(r.cache_read_tokens)
    } else {
      map.set(model, {
        model,
        cost: toFiniteNumber(r.cost),
        count: 1,
        inputTokens: toFiniteNumber(r.input_tokens),
        outputTokens: toFiniteNumber(r.output_tokens),
        cacheReadTokens: toFiniteNumber(r.cache_read_tokens),
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.cost - a.cost)
}

function formatRequestTime(timestamp: string): string {
  const value = new Date(timestamp)
  if (Number.isNaN(value.getTime())) return '--:--:--'
  return format(value, 'HH:mm:ss')
}

export function SessionDetailRow({ sessionId }: SessionDetailRowProps) {
  const { text } = useLocale()
  const { data: requests, isLoading } = useQuery({
    queryKey: ['sessionRequests', sessionId],
    queryFn: () => getSessionRequests(sessionId),
  })

  if (isLoading) {
    return (
      <div className='space-y-3 p-4'>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-32 w-full' />
      </div>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <div className='p-4 text-sm text-muted-foreground text-center'>
        {text(
          '当前会话暂无请求数据。',
          'No request data available for this session.'
        )}
      </div>
    )
  }

  const models = aggregateByModel(requests)
  const totalCacheRead = requests.reduce(
    (acc, r) => acc + toFiniteNumber(r.cache_read_tokens),
    0
  )
  const totalInputTokens = requests.reduce(
    (acc, r) => acc + toFiniteNumber(r.input_tokens),
    0
  )
  const cacheHitPercent = totalInputTokens > 0
    ? ((totalCacheRead / (totalInputTokens + totalCacheRead)) * 100).toFixed(1)
    : '0'
  const unknownModelLabel = text('未知模型', 'Unknown')

  return (
    <div className='space-y-4 p-4'>
      {/* Model breakdown */}
      <div>
        <h4 className='text-sm font-medium mb-2'>
          {text('模型拆分', 'Model Breakdown')}
        </h4>
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          {models.map((m) => (
            <div
              key={m.model}
              className='rounded-lg border p-3 space-y-1'
            >
              <div className='flex items-center justify-between'>
                <Badge variant='outline' className='text-xs'>
                  {getModelShortName(m.model, unknownModelLabel)}
                </Badge>
                <span className='font-mono text-sm font-medium text-red-600 dark:text-red-400'>
                  {formatCurrency(m.cost)}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>{m.count} {text('次请求', 'requests')}</span>
                <span>
                  {text('输入', 'In')} {formatNumber(m.inputTokens)} / {text('输出', 'Out')}{' '}
                  {formatNumber(m.outputTokens)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cache efficiency */}
      {totalCacheRead > 0 && (
        <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-emerald-700 dark:text-emerald-400'>
              {text('缓存效率', 'Cache Efficiency')}
            </span>
            <span className='text-sm font-mono font-medium text-emerald-700 dark:text-emerald-400'>
              {text(`命中率 ${cacheHitPercent}%`, `${cacheHitPercent}% hit rate`)}
            </span>
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            {text(
              `从缓存中读取了 ${formatNumber(totalCacheRead)} 个 Token`,
              `${formatNumber(totalCacheRead)} tokens read from cache`
            )}
          </p>
        </div>
      )}

      {/* Request timeline */}
      <div>
        <h4 className='text-sm font-medium mb-2'>
          {text(`请求时间线（${requests.length}）`, `Request Timeline (${requests.length})`)}
        </h4>
        <div className='rounded-md border max-h-[300px] overflow-y-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-xs'>{text('时间', 'Time')}</TableHead>
                <TableHead className='text-xs'>{text('模型', 'Model')}</TableHead>
                <TableHead className='text-xs text-right'>{text('输入', 'Input')}</TableHead>
                <TableHead className='text-xs text-right'>{text('输出', 'Output')}</TableHead>
                <TableHead className='text-xs text-right hidden sm:table-cell'>
                  {text('缓存', 'Cache')}
                </TableHead>
                <TableHead className='text-xs text-right'>{text('成本', 'Cost')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r, i) => (
                <TableRow key={r.id ?? i} className='text-xs'>
                  <TableCell className='py-1.5 font-mono'>
                    {formatRequestTime(r.timestamp)}
                  </TableCell>
                  <TableCell className='py-1.5'>
                    {getModelShortName(r.model, unknownModelLabel)}
                  </TableCell>
                  <TableCell className='py-1.5 text-right font-mono'>
                    {formatNumber(toFiniteNumber(r.input_tokens))}
                  </TableCell>
                  <TableCell className='py-1.5 text-right font-mono'>
                    {formatNumber(toFiniteNumber(r.output_tokens))}
                  </TableCell>
                  <TableCell className='py-1.5 text-right font-mono hidden sm:table-cell'>
                    {toFiniteNumber(r.cache_read_tokens) > 0
                      ? formatNumber(toFiniteNumber(r.cache_read_tokens))
                      : '-'}
                  </TableCell>
                  <TableCell className='py-1.5 text-right font-mono'>
                    {formatCurrency(toFiniteNumber(r.cost))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
