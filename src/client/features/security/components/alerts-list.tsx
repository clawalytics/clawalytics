import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Info,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import {
  acknowledgeAlert,
  acknowledgeAllAlerts,
  type SecurityAlert,
} from '@/lib/api'
import { formatRelativeTime } from '@/lib/i18n'
import { toast } from 'sonner'

interface AlertsListProps {
  alerts: SecurityAlert[]
  isLoading: boolean
  showAcknowledgeAll?: boolean
}

AlertsList.displayName = 'AlertsList'

const severityConfig = {
  critical: {
    iconBg: 'bg-red-500',
    textColor: 'text-red-500',
    icon: ShieldAlert,
    zh: '严重',
    en: 'Critical',
  },
  high: {
    iconBg: 'bg-orange-500',
    textColor: 'text-orange-500',
    icon: AlertTriangle,
    zh: '高',
    en: 'High',
  },
  medium: {
    iconBg: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: Bell,
    zh: '中',
    en: 'Medium',
  },
  low: {
    iconBg: 'bg-gray-500',
    textColor: 'text-gray-500',
    icon: Info,
    zh: '低',
    en: 'Low',
  },
} as const

export function AlertsList({
  alerts,
  isLoading,
  showAcknowledgeAll = true,
}: AlertsListProps) {
  const { locale, text } = useLocale()
  const queryClient = useQueryClient()

  const acknowledgeMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityAlerts'] })
      queryClient.invalidateQueries({ queryKey: ['securityDashboard'] })
      toast.success(text('告警已确认', 'Alert acknowledged'))
    },
    onError: () => {
      toast.error(text('确认告警失败', 'Failed to acknowledge alert'))
    },
  })

  const acknowledgeAllMutation = useMutation({
    mutationFn: acknowledgeAllAlerts,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['securityAlerts'] })
      queryClient.invalidateQueries({ queryKey: ['securityDashboard'] })
      toast.success(
        text(`已确认 ${data.count} 条告警`, `${data.count} alerts acknowledged`)
      )
    },
    onError: () => {
      toast.error(text('批量确认告警失败', 'Failed to acknowledge alerts'))
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-48' />
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-start gap-4 rounded-lg border p-4'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-8 w-24' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5' />
            {text('安全告警', 'Security Alerts')}
          </CardTitle>
          <CardDescription>
            {unacknowledgedAlerts.length > 0
              ? text(
                  `${unacknowledgedAlerts.length} 条未确认告警`,
                  `${unacknowledgedAlerts.length} unacknowledged alerts`
                )
              : text('没有未确认告警', 'No unacknowledged alerts')}
          </CardDescription>
        </div>
        {showAcknowledgeAll && unacknowledgedAlerts.length > 1 && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => acknowledgeAllMutation.mutate()}
            disabled={acknowledgeAllMutation.isPending}
          >
            <CheckCircle className='mr-2 h-4 w-4' />
            {text('全部确认', 'Acknowledge All')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <CheckCircle className='mb-4 h-12 w-12 text-emerald-500' />
            <p className='text-lg font-medium text-muted-foreground'>
              {text('未发现告警', 'No alerts found')}
            </p>
            <p className='text-sm text-muted-foreground'>
              {text('系统当前处于安全状态', 'Your system is secure')}
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const IconComponent = config.icon

              return (
                <div
                  key={alert.id}
                  className={`
                    flex items-start gap-4 rounded-lg border p-4
                    ${alert.acknowledged ? 'opacity-60' : ''}
                    transition-opacity
                  `}
                >
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-full
                      ${config.iconBg}
                    `}
                  >
                    <IconComponent className='h-5 w-5 text-white' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className={`font-jersey text-xs tracking-wider ${config.textColor}`}>
                        {locale === 'zh' ? config.zh : config.en}
                      </span>
                      <span className='text-sm font-medium'>{alert.type}</span>
                    </div>
                    <p className='truncate text-sm text-muted-foreground'>
                      {alert.message}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {formatRelativeTime(alert.timestamp, locale)}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => acknowledgeMutation.mutate(alert.id)}
                      disabled={acknowledgeMutation.isPending}
                    >
                      <CheckCircle className='mr-2 h-4 w-4' />
                      {text('确认', 'Acknowledge')}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
