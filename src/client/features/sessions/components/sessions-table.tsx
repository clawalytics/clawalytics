import { differenceInHours, differenceInMinutes } from 'date-fns'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useLocale,
  type AppLocale,
} from '@/context/locale-provider'
import type { EnhancedSession } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/format'
import { formatDurationCompact, formatRelativeTime } from '@/lib/i18n'
import { SessionDetailRow } from './session-detail-row'

interface SessionsTableProps {
  sessions: EnhancedSession[]
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (field: string) => void
  expandedSessionId: string | null
  onToggleExpand: (sessionId: string) => void
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function formatProjectPath(path: string | undefined, fallback: string): string {
  const value = path?.trim()
  if (!value) return fallback

  const parts = value.split('-')
  return parts[parts.length - 1] || value
}

function getProjectInitials(path: string | undefined, fallback: string): string {
  const name = formatProjectPath(path, fallback)
  return name.substring(0, 2).toUpperCase()
}

function getModelShortName(model: string | undefined, fallback: string): string {
  if (!isNonEmptyString(model)) return fallback

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

function getModelBadgeClass(model: string | undefined): string {
  if (!isNonEmptyString(model)) return 'border-gray-500/50'
  if (model.includes('opus')) return 'border-red-500/50 text-red-600 dark:text-red-400'
  if (model.includes('sonnet')) return 'border-rose-500/50 text-rose-600 dark:text-rose-400'
  if (model.includes('haiku')) return 'border-pink-500/50 text-pink-600 dark:text-pink-400'
  if (model.includes('gpt')) return 'border-fuchsia-500/50 text-fuchsia-600 dark:text-fuchsia-400'
  return 'border-gray-500/50'
}

function formatDuration(
  startedAt: string,
  lastActivity: string,
  locale: AppLocale
): string {
  const start = new Date(startedAt)
  const end = new Date(lastActivity)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '--'

  const hours = differenceInHours(end, start)
  const minutes = differenceInMinutes(end, start) % 60
  return formatDurationCompact(hours, minutes, locale)
}

type SortableField =
  | 'last_activity'
  | 'request_count'
  | 'total_input_tokens'
  | 'total_output_tokens'
  | 'total_cost'

function SortableHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  className,
}: {
  label: string
  field: SortableField
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (field: string) => void
  className?: string
}) {
  const isActive = sortBy === field
  const Icon = isActive ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <TableHead className={className}>
      <div
        className='flex items-center gap-1 cursor-pointer select-none hover:text-foreground'
        onClick={() => onSort(field)}
      >
        {label}
        <Icon className='h-3.5 w-3.5' />
      </div>
    </TableHead>
  )
}

export function SessionsTable({
  sessions,
  sortBy,
  sortDir,
  onSort,
  expandedSessionId,
  onToggleExpand,
}: SessionsTableProps) {
  const { locale, text } = useLocale()
  const maxCost = sessions.reduce((max, s) => Math.max(max, s.total_cost), 0)

  if (sessions.length === 0) {
    return (
      <div className='rounded-md border'>
        <div className='flex h-[200px] items-center justify-center text-muted-foreground'>
          {text(
            '没有匹配当前筛选条件的会话。',
            'No sessions found matching your filters.'
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-8' />
            <TableHead>{text('项目', 'Project')}</TableHead>
            <SortableHeader
              label={text('最近活动', 'Last Activity')}
              field='last_activity'
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
            />
            <TableHead className='hidden md:table-cell'>
              {text('持续时长', 'Duration')}
            </TableHead>
            <SortableHeader
              label={text('请求数', 'Requests')}
              field='request_count'
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
            />
            <SortableHeader
              label={text('输入', 'Input')}
              field='total_input_tokens'
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              className='hidden sm:table-cell'
            />
            <SortableHeader
              label={text('输出', 'Output')}
              field='total_output_tokens'
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
              className='hidden sm:table-cell'
            />
            <SortableHeader
              label={text('成本', 'Cost')}
              field='total_cost'
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={onSort}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const isExpanded = expandedSessionId === session.id
            return (
              <SessionTableRow
                key={session.id}
                session={session}
                isExpanded={isExpanded}
                maxCost={maxCost}
                locale={locale}
                text={text}
                onToggle={() => onToggleExpand(session.id)}
              />
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function SessionTableRow({
  session,
  isExpanded,
  maxCost,
  locale,
  text,
  onToggle,
}: {
  session: EnhancedSession
  isExpanded: boolean
  maxCost: number
  locale: AppLocale
  text: (zh: string, en: string) => string
  onToggle: () => void
}) {
  const cost = Number.isFinite(session.total_cost) ? session.total_cost : 0
  const costPercent = maxCost > 0 ? (cost / maxCost) * 100 : 0
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight
  const unknownProjectLabel = text('未知项目', 'Unknown Project')
  const unknownModelLabel = text('未知模型', 'Unknown')
  const modelsUsed = Array.isArray(session.models_used)
    ? session.models_used.filter(isNonEmptyString)
    : []

  return (
    <>
      <TableRow
        className='cursor-pointer hover:bg-muted/50'
        onClick={onToggle}
      >
        <TableCell className='py-2 w-8'>
          <ChevronIcon className='h-4 w-4 text-muted-foreground' />
        </TableCell>
        <TableCell className='py-2'>
          <div className='flex items-center gap-3'>
            <div className='hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 sm:flex'>
              <span className='text-xs font-medium text-white'>
                {getProjectInitials(session.project_path, unknownProjectLabel)}
              </span>
            </div>
            <div className='min-w-0'>
              <div className='font-medium truncate max-w-[120px] sm:max-w-[180px]'>
                {formatProjectPath(session.project_path, unknownProjectLabel)}
              </div>
              <div className='flex gap-1 mt-0.5 flex-wrap'>
                {modelsUsed.slice(0, 2).map((model) => (
                  <Badge
                    key={model}
                    variant='outline'
                    className={`text-[10px] px-1 py-0 ${getModelBadgeClass(model)}`}
                  >
                    {getModelShortName(model, unknownModelLabel)}
                  </Badge>
                ))}
                {modelsUsed.length === 0 && (
                  <Badge variant='outline' className='text-[10px] px-1 py-0'>
                    {unknownModelLabel}
                  </Badge>
                )}
                {modelsUsed.length > 2 && (
                  <Badge variant='outline' className='text-[10px] px-1 py-0'>
                    +{modelsUsed.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className='py-2 text-muted-foreground text-sm'>
          {formatRelativeTime(session.last_activity, locale)}
        </TableCell>
        <TableCell className='py-2 text-muted-foreground text-sm hidden md:table-cell'>
          {formatDuration(session.started_at, session.last_activity, locale)}
        </TableCell>
        <TableCell className='py-2 font-mono text-sm text-right'>
          {session.request_count ?? 0}
        </TableCell>
        <TableCell className='py-2 font-mono text-sm text-right hidden sm:table-cell'>
          {formatNumber(session.total_input_tokens ?? 0)}
        </TableCell>
        <TableCell className='py-2 font-mono text-sm text-right hidden sm:table-cell'>
          {formatNumber(session.total_output_tokens ?? 0)}
        </TableCell>
        <TableCell className='py-2'>
          <div className='flex items-center gap-2 justify-end'>
            <span className='font-mono text-sm font-medium'>
              {formatCurrency(cost)}
            </span>
            <div className='relative h-2 w-16 overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full bg-red-500 transition-all'
                style={{ width: `${costPercent}%` }}
              />
            </div>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={8} className='p-0 bg-muted/30'>
            <SessionDetailRow sessionId={session.id} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
