import { Globe, HelpCircle, Monitor, Smartphone } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { type Device } from '@/lib/api'
import { formatDate, formatRelativeTime } from '@/lib/i18n'

interface DevicesTableProps {
  devices: Device[]
  isLoading: boolean
}

DevicesTable.displayName = 'DevicesTable'

const deviceTypeConfig: Record<
  string,
  {
    icon: typeof Smartphone
    zh: string
    en: string
  }
> = {
  mobile: {
    icon: Smartphone,
    zh: '移动端',
    en: 'Mobile',
  },
  desktop: {
    icon: Monitor,
    zh: '桌面端',
    en: 'Desktop',
  },
  browser: {
    icon: Globe,
    zh: '浏览器',
    en: 'Browser',
  },
}

const defaultDeviceConfig = {
  icon: HelpCircle,
  zh: '未知',
  en: 'Unknown',
}

const statusConfig: Record<
  string,
  {
    className: string
    zh: string
    en: string
  }
> = {
  active: {
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    zh: '活跃',
    en: 'Active',
  },
  inactive: {
    className:
      'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
    zh: '不活跃',
    en: 'Inactive',
  },
  suspended: {
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    zh: '已停用',
    en: 'Suspended',
  },
}

const defaultStatusConfig = {
  className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
  zh: '未知',
  en: 'Unknown',
}

export function DevicesTable({ devices, isLoading }: DevicesTableProps) {
  const { locale, text } = useLocale()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-48' />
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{text('设备', 'Device')}</TableHead>
                  <TableHead>{text('类型', 'Type')}</TableHead>
                  <TableHead>{text('状态', 'Status')}</TableHead>
                  <TableHead>{text('最近在线', 'Last Seen')}</TableHead>
                  <TableHead className='text-right'>
                    {text('连接次数', 'Connections')}
                  </TableHead>
                  <TableHead>{text('配对时间', 'Paired At')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className='h-4 w-32' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-16' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-16' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='ml-auto h-4 w-8' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-20' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Smartphone className='h-5 w-5' />
          {text('已配对设备', 'Paired Devices')}
        </CardTitle>
        <CardDescription>
          {devices.length > 0
            ? text(`已配对 ${devices.length} 台设备`, `${devices.length} paired devices`)
            : text('暂无已配对设备', 'No paired devices')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Smartphone className='mb-4 h-12 w-12 text-muted-foreground' />
            <p className='text-lg font-medium text-muted-foreground'>
              {text('未找到设备', 'No devices found')}
            </p>
            <p className='text-sm text-muted-foreground'>
              {text('先完成设备配对后再查看。', 'Pair a device first to see it here.')}
            </p>
          </div>
        ) : (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{text('设备', 'Device')}</TableHead>
                  <TableHead>{text('类型', 'Type')}</TableHead>
                  <TableHead>{text('状态', 'Status')}</TableHead>
                  <TableHead>{text('最近在线', 'Last Seen')}</TableHead>
                  <TableHead className='text-right'>
                    {text('连接次数', 'Connections')}
                  </TableHead>
                  <TableHead>{text('配对时间', 'Paired At')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
                  const typeConfig =
                    deviceTypeConfig[device.type ?? ''] ?? defaultDeviceConfig
                  const statusCfg =
                    statusConfig[device.status] ?? defaultStatusConfig
                  const IconComponent = typeConfig.icon

                  return (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <IconComponent className='h-4 w-4 text-muted-foreground' />
                          <span className='font-medium'>
                            {device.name ?? text('未命名设备', 'Unnamed device')}
                          </span>
                        </div>
                        <span className='font-mono text-xs text-muted-foreground'>
                          {device.id.slice(0, 12)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {locale === 'zh' ? typeConfig.zh : typeConfig.en}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusCfg.className}>
                          {locale === 'zh' ? statusCfg.zh : statusCfg.en}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.last_seen ? (
                          <span className='text-sm'>
                            {formatRelativeTime(device.last_seen, locale)}
                          </span>
                        ) : (
                          <span className='text-sm text-muted-foreground'>
                            {text('从未', 'Never')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='text-right font-mono'>
                        {device.connection_count}
                      </TableCell>
                      <TableCell>
                        <span className='text-sm'>
                          {formatDate(device.paired_at, 'yyyy/MM/dd', locale)}
                        </span>
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
  )
}
