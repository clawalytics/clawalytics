import { Fragment, useState } from 'react'
import {
  Activity,
  ChevronDown,
  ChevronRight,
  FileSearch,
  Globe,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { type AuditEntry } from '@/lib/api'
import { formatDate } from '@/lib/i18n'

interface AuditTableProps {
  entries: AuditEntry[]
  isLoading: boolean
}

AuditTable.displayName = 'AuditTable'

interface ExpandedRows {
  [key: number]: boolean
}

const actionConfig: Record<
  string,
  {
    className: string
    zh: string
    en: string
  }
> = {
  create: {
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    zh: '创建',
    en: 'Created',
  },
  update: {
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    zh: '更新',
    en: 'Updated',
  },
  delete: {
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    zh: '删除',
    en: 'Deleted',
  },
  login: {
    className:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    zh: '登录',
    en: 'Login',
  },
  logout: {
    className:
      'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
    zh: '登出',
    en: 'Logout',
  },
  access: {
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    zh: '访问',
    en: 'Access',
  },
}

const defaultActionConfig = {
  className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
  zh: '操作',
  en: 'Action',
}

function translateEntity(type: string | null, locale: 'zh' | 'en'): string {
  if (!type) return '-'

  const labels: Record<string, { zh: string; en: string }> = {
    device: { zh: '设备', en: 'Device' },
    session: { zh: '会话', en: 'Session' },
    config: { zh: '配置', en: 'Config' },
    alert: { zh: '告警', en: 'Alert' },
    user: { zh: '用户', en: 'User' },
  }

  const entry = labels[type]
  return entry ? (locale === 'zh' ? entry.zh : entry.en) : type
}

export function AuditTable({ entries, isLoading }: AuditTableProps) {
  const { locale, text } = useLocale()
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({})

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (isLoading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-8' />
              <TableHead>{text('操作', 'Action')}</TableHead>
              <TableHead>{text('对象', 'Entity')}</TableHead>
              <TableHead>{text('操作人', 'Actor')}</TableHead>
              <TableHead>{text('时间', 'Timestamp')}</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className='h-4 w-4' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-28' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-md border py-12 text-center'>
        <FileSearch className='mb-4 h-12 w-12 text-muted-foreground' />
        <p className='text-lg font-medium text-muted-foreground'>
          {text('未找到审计记录', 'No audit entries found')}
        </p>
        <p className='text-sm text-muted-foreground'>
          {text('后续活动会记录在这里', 'Activities will be logged here')}
        </p>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-8' />
            <TableHead>{text('操作', 'Action')}</TableHead>
            <TableHead>{text('对象', 'Entity')}</TableHead>
            <TableHead>{text('操作人', 'Actor')}</TableHead>
            <TableHead>{text('时间', 'Timestamp')}</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const config = actionConfig[entry.action] ?? defaultActionConfig
            const isExpanded = expandedRows[entry.id]
            const hasDetails = entry.details !== null && entry.details !== ''

            return (
              <Fragment key={entry.id}>
                <TableRow
                  className={hasDetails ? 'cursor-pointer' : ''}
                  onClick={() => hasDetails && toggleRow(entry.id)}
                >
                  <TableCell>
                    {hasDetails ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0'
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRow(entry.id)
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </Button>
                    ) : (
                      <Activity className='h-4 w-4 text-muted-foreground' />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={config.className}>
                      {locale === 'zh' ? config.zh : config.en}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.entity_type ? (
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium'>
                          {translateEntity(entry.entity_type, locale)}
                        </span>
                        {entry.entity_id && (
                          <span className='font-mono text-xs text-muted-foreground'>
                            {entry.entity_id.length > 12
                              ? `${entry.entity_id.slice(0, 12)}...`
                              : entry.entity_id}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className='text-sm text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.actor ? (
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{entry.actor}</span>
                      </div>
                    ) : (
                      <span className='text-sm text-muted-foreground'>
                        {text('系统', 'System')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className='text-sm'>
                      {formatDate(
                        entry.timestamp,
                        locale === 'zh'
                          ? 'yyyy/MM/dd HH:mm:ss'
                          : 'MM/dd/yyyy HH:mm:ss',
                        locale
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    {entry.ip_address ? (
                      <div className='flex items-center gap-2'>
                        <Globe className='h-4 w-4 text-muted-foreground' />
                        <span className='font-mono text-sm'>
                          {entry.ip_address}
                        </span>
                      </div>
                    ) : (
                      <span className='text-sm text-muted-foreground'>-</span>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && hasDetails && (
                  <TableRow>
                    <TableCell colSpan={6} className='bg-muted/50'>
                      <div className='px-4 py-3'>
                        <p className='mb-1 text-xs font-medium text-muted-foreground'>
                          {text('详情', 'Details')}
                        </p>
                        <pre className='whitespace-pre-wrap rounded-md border bg-background p-3 font-mono text-sm'>
                          {entry.details}
                        </pre>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
