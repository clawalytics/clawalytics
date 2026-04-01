import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  Clock,
  Download,
  Search,
  Wrench,
} from 'lucide-react'
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
import { ToolsIcon } from '@/components/icons/tools-icon'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLocale } from '@/context/locale-provider'
import { getOutboundCalls, getToolStats } from '@/lib/api'
import { formatRelativeTime } from '@/lib/i18n'

ToolsAnalytics.displayName = 'ToolsAnalytics'

const PAGE_SIZE = 50

const statusOptions = [
  { value: 'all', zh: '全部状态', en: 'All Statuses' },
  { value: 'success', zh: '成功', en: 'Success' },
  { value: 'error', zh: '失败', en: 'Error' },
  { value: 'pending', zh: '处理中', en: 'Pending' },
]

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

function getStatusLabel(
  status: string | null | undefined,
  locale: 'zh' | 'en'
): string {
  const labels: Record<string, { zh: string; en: string }> = {
    success: { zh: '成功', en: 'Success' },
    error: { zh: '失败', en: 'Error' },
    pending: { zh: '处理中', en: 'Pending' },
  }

  if (!status) return locale === 'zh' ? '未知' : 'Unknown'
  const label = labels[status]
  return label ? (locale === 'zh' ? label.zh : label.en) : status
}

export function ToolsAnalytics() {
  const { locale, text } = useLocale()
  const [page, setPage] = useState(0)
  const [toolNameSearch, setToolNameSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filters = {
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    toolName: toolNameSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }

  const { data: toolCallsData, isLoading: callsLoading } = useQuery({
    queryKey: ['toolCalls', filters],
    queryFn: () => getOutboundCalls(filters),
    refetchInterval: 10000,
  })

  const { data: toolStats, isLoading: statsLoading } = useQuery({
    queryKey: ['toolStats'],
    queryFn: () => getToolStats(30),
    refetchInterval: 30000,
  })

  const toolCalls = toolCallsData?.calls ?? []
  const total = toolCallsData?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const startItem = page * PAGE_SIZE + 1
  const endItem = Math.min((page + 1) * PAGE_SIZE, total)

  const errorCalls = toolCalls.filter((call) => call.status === 'error').length
  const validDurations = toolCalls
    .map((call) => call.duration_ms)
    .filter((duration): duration is number => duration !== null)
  const errorRate =
    toolCalls.length > 0 ? (errorCalls / toolCalls.length) * 100 : 0
  const avgDuration =
    validDurations.length > 0
      ? validDurations.reduce((sum, duration) => sum + duration, 0) /
        validDurations.length
      : 0

  const chartData = (toolStats ?? [])
    .slice(0, 10)
    .map((stat) => ({
      name:
        stat.toolName.length > 15
          ? `${stat.toolName.slice(0, 12)}...`
          : stat.toolName,
      fullName: stat.toolName,
      count: stat.count,
      avgDuration: Math.round(stat.avgDuration),
    }))
    .reverse()

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <ToolsIcon active className='h-6 w-6' />
          <span className='font-jersey text-xl'>{text('工具', 'Tools')}</span>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {text('工具分析', 'Tool Analytics')}
            </h1>
            <p className='text-muted-foreground'>
              {text(
                '查看工具调用与运行统计',
                'Inspect tool call activity and execution stats'
              )}
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.open('/api/export/tools?format=csv', '_blank')}
          >
            <Download className='mr-2 h-4 w-4' />
            {text('导出 CSV', 'Export CSV')}
          </Button>
        </div>

        <div className='mb-6 grid gap-4 sm:grid-cols-3'>
          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('总调用数', 'Total Calls')}
              </CardTitle>
              <div className='rounded-full bg-red-500/10 p-2'>
                <Activity className='h-4 w-4 text-red-500' />
              </div>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <>
                  <Skeleton className='mb-1 h-8 w-16' />
                  <Skeleton className='h-4 w-24' />
                </>
              ) : (
                <>
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {total}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('工具总调用次数', 'Total tool invocations')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('平均耗时', 'Average Duration')}
              </CardTitle>
              <div className='rounded-full bg-red-500/10 p-2'>
                <Clock className='h-4 w-4 text-red-500' />
              </div>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <>
                  <Skeleton className='mb-1 h-8 w-20' />
                  <Skeleton className='h-4 w-24' />
                </>
              ) : (
                <>
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {avgDuration > 0 ? `${Math.round(avgDuration)}ms` : '-'}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('每次调用', 'Per invocation')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('失败率', 'Error Rate')}
              </CardTitle>
              <div className='rounded-full bg-red-500/10 p-2'>
                <AlertCircle className='h-4 w-4 text-red-500' />
              </div>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <>
                  <Skeleton className='mb-1 h-8 w-16' />
                  <Skeleton className='h-4 w-24' />
                </>
              ) : (
                <>
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {errorRate.toFixed(1)}%
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text(
                      `共 ${toolCalls.length} 次调用，其中失败 ${errorCalls} 次`,
                      `${errorCalls} failed out of ${toolCalls.length} calls`
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>{text('工具使用情况', 'Tool Usage')}</CardTitle>
              <CardDescription>
                {text('最近 30 天最常用的工具', 'Most-used tools in the last 30 days')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className='h-[300px] w-full' />
              ) : chartData.length === 0 ? (
                <div className='flex h-[300px] flex-col items-center justify-center'>
                  <Wrench className='mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-muted-foreground'>
                    {text('暂无数据', 'No data')}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={chartData}
                    layout='vertical'
                    margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                    <XAxis type='number' className='text-xs' />
                    <YAxis
                      dataKey='name'
                      type='category'
                      width={100}
                      interval={0}
                      className='text-xs'
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as (typeof chartData)[0]

                          return (
                            <div className='rounded-lg border bg-background p-3 shadow-md'>
                              <p className='font-medium'>{item.fullName}</p>
                              <p className='text-sm text-muted-foreground'>
                                {text('调用次数：', 'Calls:')} {item.count}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                {text('平均耗时：', 'Avg duration:')} {item.avgDuration}ms
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey='count' radius={[0, 4, 4, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{text('最近工具调用', 'Recent Tool Calls')}</CardTitle>
              <CardDescription>
                {text('最近 10 条工具调用', 'Latest 10 tool calls')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className='space-y-4'>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className='flex items-center gap-4'>
                      <Skeleton className='h-8 w-8 rounded-full' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-3 w-24' />
                      </div>
                      <Skeleton className='h-5 w-16' />
                    </div>
                  ))}
                </div>
              ) : toolCalls.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8'>
                  <Activity className='mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-muted-foreground'>
                    {text('未找到工具调用', 'No tool calls found')}
                  </p>
                </div>
              ) : (
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{text('工具', 'Tool')}</TableHead>
                        <TableHead>{text('状态', 'Status')}</TableHead>
                        <TableHead className='text-right'>
                          {text('耗时', 'Duration')}
                        </TableHead>
                        <TableHead>{text('时间', 'Time')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {toolCalls.slice(0, 10).map((call) => {
                        const isError = call.status === 'error'
                        const isSuccess = call.status === 'success'

                        return (
                          <TableRow key={call.id}>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Wrench className='h-4 w-4 text-muted-foreground' />
                                <span className='font-medium text-sm'>
                                  {call.tool_name.length > 20
                                    ? `${call.tool_name.slice(0, 17)}...`
                                    : call.tool_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-jersey text-xs uppercase tracking-wider ${
                                  isError
                                    ? 'text-red-600 dark:text-red-400'
                                    : isSuccess
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                {getStatusLabel(call.status, locale)}
                              </span>
                            </TableCell>
                            <TableCell className='text-right font-mono text-sm'>
                              {call.duration_ms !== null ? `${call.duration_ms}ms` : '-'}
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {formatRelativeTime(call.timestamp, locale)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>{text('全部工具调用', 'All Tool Calls')}</CardTitle>
            <CardDescription>
              {total > 0
                ? text(
                    `显示第 ${startItem}-${endItem} 条，共 ${total} 次调用`,
                    `Showing ${startItem}-${endItem} of ${total} calls`
                  )
                : text('未找到调用记录', 'No calls found')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center'>
              <div className='relative max-w-sm flex-1'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={text('按工具名称搜索...', 'Search by tool name...')}
                  value={toolNameSearch}
                  onChange={(e) => {
                    setToolNameSearch(e.target.value)
                    setPage(0)
                  }}
                  className='pl-8'
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(0)
                }}
              >
                <SelectTrigger className='w-[170px]'>
                  <SelectValue placeholder={text('按状态筛选', 'Filter by status')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {text(option.zh, option.en)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {callsLoading ? (
              <div className='space-y-4'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='h-12 animate-pulse rounded bg-muted' />
                ))}
              </div>
            ) : toolCalls.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8'>
                <Activity className='mb-4 h-12 w-12 text-muted-foreground' />
                <p className='text-muted-foreground'>
                  {text('未找到调用记录', 'No tool calls found')}
                </p>
              </div>
            ) : (
              <>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{text('工具', 'Tool')}</TableHead>
                        <TableHead>{text('状态', 'Status')}</TableHead>
                        <TableHead className='text-right'>
                          {text('耗时', 'Duration')}
                        </TableHead>
                        <TableHead>{text('时间', 'Time')}</TableHead>
                        <TableHead>{text('代理', 'Agent')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {toolCalls.map((call) => {
                        const isError = call.status === 'error'
                        const isSuccess = call.status === 'success'

                        return (
                          <TableRow key={call.id}>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Wrench className='h-4 w-4 text-muted-foreground' />
                                <span className='font-medium text-sm' title={call.tool_name}>
                                  {call.tool_name.length > 30
                                    ? `${call.tool_name.slice(0, 27)}...`
                                    : call.tool_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-jersey text-xs uppercase tracking-wider ${
                                  isError
                                    ? 'text-red-600 dark:text-red-400'
                                    : isSuccess
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                {getStatusLabel(call.status, locale)}
                              </span>
                            </TableCell>
                            <TableCell className='text-right font-mono text-sm'>
                              {call.duration_ms !== null ? `${call.duration_ms}ms` : '-'}
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {formatRelativeTime(call.timestamp, locale)}
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {call.agent_id
                                ? call.agent_id.length > 15
                                  ? `${call.agent_id.slice(0, 12)}...`
                                  : call.agent_id
                                : '-'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className='mt-4 flex items-center justify-between'>
                  <p className='text-sm text-muted-foreground'>
                    {text(`共 ${total} 次调用`, `${total} calls total`)}
                  </p>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      {text(
                        `第 ${page + 1} 页 / 共 ${Math.max(1, totalPages)} 页`,
                        `Page ${page + 1} / ${Math.max(1, totalPages)}`
                      )}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      disabled={page === 0}
                    >
                      {text('上一页', 'Previous')}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage((current) => current + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      {text('下一页', 'Next')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
