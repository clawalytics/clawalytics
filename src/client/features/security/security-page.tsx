import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import {
  AlertTriangle,
  Download,
  Link,
  Search,
  Smartphone,
  X,
} from 'lucide-react'
import { SecurityIcon } from '@/components/icons/security-icon'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocale } from '@/context/locale-provider'
import {
  getAlerts,
  getAuditLog,
  getDevices,
  getRecentConnections,
  getSecurityDashboard,
  type AuditFilters,
} from '@/lib/api'
import { AlertsList } from './components/alerts-list'
import { AuditTable } from './components/audit-table'
import { ConnectionsList } from './components/connections-list'
import { DevicesTable } from './components/devices-table'

const PAGE_SIZE = 50

const actionOptions = [
  { value: 'all', zh: '全部操作', en: 'All Actions' },
  { value: 'create', zh: '创建', en: 'Create' },
  { value: 'update', zh: '更新', en: 'Update' },
  { value: 'delete', zh: '删除', en: 'Delete' },
  { value: 'login', zh: '登录', en: 'Login' },
  { value: 'logout', zh: '登出', en: 'Logout' },
  { value: 'access', zh: '访问', en: 'Access' },
]

const entityTypeOptions = [
  { value: 'all', zh: '全部对象', en: 'All Entities' },
  { value: 'device', zh: '设备', en: 'Device' },
  { value: 'session', zh: '会话', en: 'Session' },
  { value: 'config', zh: '配置', en: 'Config' },
  { value: 'alert', zh: '告警', en: 'Alert' },
  { value: 'user', zh: '用户', en: 'User' },
]

export function SecurityPage() {
  const { text } = useLocale()
  const [activeTab, setActiveTab] = useState('overview')
  const visitedTabs = useRef(new Set(['overview']))

  const defaultStartDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  const defaultEndDate = format(new Date(), 'yyyy-MM-dd')

  const [page, setPage] = useState(0)
  const [action, setAction] = useState<string>('all')
  const [entityType, setEntityType] = useState<string>('all')
  const [actor, setActor] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  const handleTabChange = (tab: string) => {
    visitedTabs.current.add(tab)
    setActiveTab(tab)
  }

  const hasVisited = (tab: string) => visitedTabs.current.has(tab)

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['securityDashboard'],
    queryFn: getSecurityDashboard,
    refetchInterval: 10000,
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['securityAlerts'],
    queryFn: () => getAlerts(false, 10),
    refetchInterval: 10000,
  })

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['recentConnections'],
    queryFn: () => getRecentConnections(24),
    refetchInterval: 10000,
  })

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
    refetchInterval: 10000,
    enabled: hasVisited('devices'),
  })

  const activeFilters: AuditFilters = {
    action: action !== 'all' ? action : undefined,
    entityType: entityType !== 'all' ? entityType : undefined,
    actor: actor || undefined,
    ipAddress: ipAddress || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  }

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['auditLog', activeFilters],
    queryFn: () => getAuditLog(activeFilters),
    refetchInterval: 30000,
    enabled: hasVisited('audit'),
  })

  const auditEntries = auditData?.entries ?? []
  const total = auditData?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const startItem = page * PAGE_SIZE + 1
  const endItem = Math.min((page + 1) * PAGE_SIZE, total)

  const hasActiveFilters =
    action !== 'all' ||
    entityType !== 'all' ||
    Boolean(actor) ||
    Boolean(ipAddress) ||
    startDate !== defaultStartDate ||
    endDate !== defaultEndDate

  const handleResetFilters = () => {
    setAction('all')
    setEntityType('all')
    setActor('')
    setIpAddress('')
    setStartDate(defaultStartDate)
    setEndDate(defaultEndDate)
    setPage(0)
  }

  const exportAuditCSV = () => {
    if (auditEntries.length === 0) return

    const headers = [
      'ID',
      'Action',
      'Entity Type',
      'Entity ID',
      'Timestamp',
      'Actor',
      'IP Address',
      'Details',
    ]
    const rows = auditEntries.map((entry) => [
      entry.id,
      entry.action,
      entry.entity_type ?? '',
      entry.entity_id ?? '',
      entry.timestamp,
      entry.actor ?? '',
      entry.ip_address ?? '',
      entry.details ?? '',
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' && cell.includes(',')
              ? `"${cell.replace(/"/g, '""')}"`
              : cell
          )
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <SecurityIcon active className='h-6 w-6' />
          <span className='font-jersey text-xl'>
            {text('安全中心', 'Security Center')}
          </span>
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
              {text('安全中心', 'Security Center')}
            </h1>
            <p className='text-muted-foreground'>
              {text(
                '监控设备、告警和连接活动',
                'Monitor devices, alerts, and connection activity'
              )}
            </p>
          </div>
        </div>

        <div className='mb-6 grid gap-4 sm:grid-cols-3'>
          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('活跃设备', 'Active Devices')}
              </CardTitle>
              <div className='rounded-full bg-red-500 p-2'>
                <Smartphone className='h-4 w-4 text-white' />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <>
                  <Skeleton className='mb-1 h-8 w-16' />
                  <Skeleton className='h-4 w-24' />
                </>
              ) : (
                <>
                  <div className='text-2xl font-bold text-red-500'>
                    {dashboardStats?.activeDevices ?? 0}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('已配对设备', 'Paired devices')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('未确认告警', 'Unacknowledged Alerts')}
              </CardTitle>
              <div className='rounded-full bg-red-500 p-2'>
                <AlertTriangle className='h-4 w-4 text-white' />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <>
                  <Skeleton className='mb-1 h-8 w-16' />
                  <Skeleton className='h-4 w-24' />
                </>
              ) : (
                <>
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {dashboardStats?.unacknowledgedAlerts ?? 0}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('待处理', 'Needs attention')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden'>
            <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {text('连接数（24 小时）', 'Connections (24h)')}
              </CardTitle>
              <div className='rounded-full bg-red-500 p-2'>
                <Link className='h-4 w-4 text-white' />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <>
                  <Skeleton className='mb-1 h-8 w-16' />
                  <Skeleton className='h-4 w-24' />
                </>
              ) : (
                <>
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                    {dashboardStats?.recentConnections ?? 0}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {text('最近 24 小时', 'Last 24 hours')}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {dashboardStats?.alertsByLevel && (
          <div className='mb-6 grid gap-4 sm:grid-cols-4'>
            <SeverityCard
              label={text('严重', 'Critical')}
              value={dashboardStats.alertsByLevel.critical}
              className='border-l-red-500 text-red-600 dark:text-red-400'
            />
            <SeverityCard
              label={text('高', 'High')}
              value={dashboardStats.alertsByLevel.high}
              className='border-l-orange-500 text-orange-600 dark:text-orange-400'
            />
            <SeverityCard
              label={text('中', 'Medium')}
              value={dashboardStats.alertsByLevel.medium}
              className='border-l-yellow-500 text-yellow-600 dark:text-yellow-400'
            />
            <SeverityCard
              label={text('低', 'Low')}
              value={dashboardStats.alertsByLevel.low}
              className='border-l-gray-400 text-gray-600 dark:text-gray-400'
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value='overview'>{text('概览', 'Overview')}</TabsTrigger>
            <TabsTrigger value='devices'>{text('设备', 'Devices')}</TabsTrigger>
            <TabsTrigger value='audit'>{text('审计日志', 'Audit Log')}</TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <div className='grid gap-6 lg:grid-cols-2'>
              <AlertsList
                alerts={alerts ?? []}
                isLoading={alertsLoading}
                showAcknowledgeAll
              />
              <ConnectionsList
                connections={connections ?? []}
                isLoading={connectionsLoading}
                title={text('最近连接', 'Recent Connections')}
                description={text(
                  '最近 24 小时的连接活动',
                  'Connection activity in the last 24 hours'
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value='devices'>
            <DevicesTable devices={devices ?? []} isLoading={devicesLoading} />
          </TabsContent>

          <TabsContent value='audit'>
            <div className='mb-4 flex flex-wrap items-end gap-3'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={text('操作人...', 'Actor...')}
                  value={actor}
                  onChange={(e) => {
                    setActor(e.target.value)
                    setPage(0)
                  }}
                  className='h-9 w-36 pl-8'
                />
              </div>

              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={text('IP 地址...', 'IP address...')}
                  value={ipAddress}
                  onChange={(e) => {
                    setIpAddress(e.target.value)
                    setPage(0)
                  }}
                  className='h-9 w-36 pl-8'
                />
              </div>

              <Select
                value={action}
                onValueChange={(value) => {
                  setAction(value)
                  setPage(0)
                }}
              >
                <SelectTrigger className='h-9 w-[140px]'>
                  <SelectValue placeholder={text('全部操作', 'All Actions')} />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {text(option.zh, option.en)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={entityType}
                onValueChange={(value) => {
                  setEntityType(value)
                  setPage(0)
                }}
              >
                <SelectTrigger className='h-9 w-[140px]'>
                  <SelectValue placeholder={text('全部对象', 'All Entities')} />
                </SelectTrigger>
                <SelectContent>
                  {entityTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {text(option.zh, option.en)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type='date'
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(0)
                }}
                className='h-9 w-[140px]'
              />

              <span className='pb-1 text-sm text-muted-foreground'>&ndash;</span>

              <Input
                type='date'
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(0)
                }}
                className='h-9 w-[140px]'
              />

              {hasActiveFilters && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-9'
                  onClick={handleResetFilters}
                >
                  <X className='mr-1 h-3.5 w-3.5' />
                  {text('重置', 'Reset')}
                </Button>
              )}

              <div className='ml-auto'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-9'
                  onClick={exportAuditCSV}
                  disabled={auditEntries.length === 0}
                >
                  <Download className='mr-2 h-4 w-4' />
                  {text('导出 CSV', 'Export CSV')}
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className='pt-6'>
                <AuditTable entries={auditEntries} isLoading={auditLoading} />

                {total > 0 && (
                  <div className='mt-4 flex items-center justify-between'>
                    <p className='text-sm text-muted-foreground'>
                      {text(
                        `显示第 ${startItem}-${endItem} 条，共 ${total} 条记录`,
                        `Showing ${startItem}-${endItem} of ${total} records`
                      )}
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

function SeverityCard({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className: string
}) {
  const borderClass = className.split(' ')[0]
  const textClass = className.split(' ').slice(1).join(' ')

  return (
    <Card className={`border-l-4 ${borderClass}`}>
      <CardContent className='pt-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>{label}</span>
          <span className={`text-2xl font-bold ${textClass}`}>{value}</span>
        </div>
      </CardContent>
    </Card>
  )
}

SecurityPage.displayName = 'SecurityPage'
