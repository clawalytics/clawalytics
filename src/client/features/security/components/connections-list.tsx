import {
  Activity,
  Globe,
  Link,
  Link2Off,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import { type ConnectionEvent } from '@/lib/api'
import { formatRelativeTime } from '@/lib/i18n'

interface ConnectionsListProps {
  connections: ConnectionEvent[]
  isLoading: boolean
  title?: string
  description?: string
}

ConnectionsList.displayName = 'ConnectionsList'

const eventTypeConfig: Record<
  string,
  {
    iconBg: string
    textColor: string
    icon: typeof Link
    zh: string
    en: string
  }
> = {
  connection: {
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    icon: Link,
    zh: '连接',
    en: 'Connection',
  },
  disconnection: {
    iconBg: 'bg-gray-500',
    textColor: 'text-gray-500',
    icon: Link2Off,
    zh: '断开',
    en: 'Disconnection',
  },
  auth_failure: {
    iconBg: 'bg-red-500',
    textColor: 'text-red-500',
    icon: ShieldX,
    zh: '认证失败',
    en: 'Auth Failure',
  },
  auth_success: {
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: ShieldCheck,
    zh: '认证成功',
    en: 'Auth Success',
  },
  heartbeat: {
    iconBg: 'bg-violet-500',
    textColor: 'text-violet-500',
    icon: Activity,
    zh: '心跳',
    en: 'Heartbeat',
  },
}

const defaultEventConfig = {
  iconBg: 'bg-gray-500',
  textColor: 'text-gray-500',
  icon: Globe,
  zh: '未知',
  en: 'Unknown',
}

export function ConnectionsList({
  connections,
  isLoading,
  title,
  description,
}: ConnectionsListProps) {
  const { locale, text } = useLocale()

  const resolvedTitle = title ?? text('连接事件', 'Connection Events')
  const resolvedDescription =
    description ?? text('最近连接活动', 'Recent connection activity')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-4 w-56' />
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-center gap-4 rounded-lg border p-3'>
                <Skeleton className='h-8 w-8 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-32' />
                </div>
                <Skeleton className='h-4 w-20' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Globe className='h-5 w-5' />
          {resolvedTitle}
        </CardTitle>
        <CardDescription>{resolvedDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Activity className='mb-4 h-12 w-12 text-muted-foreground' />
            <p className='text-lg font-medium text-muted-foreground'>
              {text('暂无连接事件', 'No connection events')}
            </p>
            <p className='text-sm text-muted-foreground'>
              {text('还没有记录到相关活动', 'No activity recorded yet')}
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {connections.map((connection) => {
              const config =
                eventTypeConfig[connection.event_type] ?? defaultEventConfig
              const IconComponent = config.icon

              return (
                <div
                  key={connection.id}
                  className='flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50'
                >
                  <div
                    className={`
                      flex h-8 w-8 items-center justify-center rounded-full
                      ${config.iconBg}
                    `}
                  >
                    <IconComponent className='h-4 w-4 text-white' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className={`font-jersey text-xs tracking-wider ${config.textColor}`}>
                        {locale === 'zh' ? config.zh : config.en}
                      </span>
                      {connection.device_id && (
                        <span className='truncate font-mono text-xs text-muted-foreground'>
                          {connection.device_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    <div className='mt-1 flex items-center gap-2'>
                      {connection.ip_address && (
                        <span className='text-xs text-muted-foreground'>
                          IP: {connection.ip_address}
                        </span>
                      )}
                      {connection.details && (
                        <span className='truncate text-xs text-muted-foreground'>
                          {connection.details}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className='whitespace-nowrap text-xs text-muted-foreground'>
                    {formatRelativeTime(connection.timestamp, locale)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
