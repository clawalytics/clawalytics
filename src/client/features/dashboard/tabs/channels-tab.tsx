import { useQuery } from '@tanstack/react-query'
import { Coins, DollarSign, Mail, MessageSquare } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import { ChannelComparisonChart } from '@/features/channels/components/channel-comparison-chart'
import { ChannelsTable } from '@/features/channels/components/channels-table'
import { getChannelStats } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/format'

interface ChannelsTabProps {
  enabled: boolean
}

export function ChannelsTab({ enabled }: ChannelsTabProps) {
  const { text } = useLocale()

  const { data: channelStats, isLoading } = useQuery({
    queryKey: ['channelStats'],
    queryFn: () => getChannelStats(50),
    refetchInterval: 10000,
    enabled,
  })

  const channels = channelStats?.channels ?? []
  const totalInputTokens = channels.reduce(
    (acc, channel) => acc + channel.total_input_tokens,
    0
  )
  const totalOutputTokens = channels.reduce(
    (acc, channel) => acc + channel.total_output_tokens,
    0
  )

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('渠道总成本', 'Total Channel Cost')}
            </CardTitle>
            <div className='rounded-full bg-red-500/10 p-2'>
              <DollarSign className='h-4 w-4 text-red-500' />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-24' />
                <Skeleton className='h-4 w-32' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {formatCurrency(channelStats?.totalCost ?? 0)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text('所有渠道合计', 'Across all channels')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-rose-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('渠道数量', 'Channels')}
            </CardTitle>
            <div className='rounded-full bg-rose-500/10 p-2'>
              <MessageSquare className='h-4 w-4 text-rose-500' />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-16' />
                <Skeleton className='h-4 w-24' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-rose-600 dark:text-rose-400'>
                  {channels.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text('活跃渠道', 'Active channels')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('总 Token 数', 'Total Tokens')}
            </CardTitle>
            <div className='rounded-full bg-red-500/10 p-2'>
              <Coins className='h-4 w-4 text-red-500' />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-24' />
                <Skeleton className='h-4 w-32' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {formatNumber(totalInputTokens + totalOutputTokens)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text(
                    `输入 ${formatNumber(totalInputTokens)} / 输出 ${formatNumber(totalOutputTokens)}`,
                    `In ${formatNumber(totalInputTokens)} / Out ${formatNumber(totalOutputTokens)}`
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden'>
          <div className='absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-red-500/10 to-transparent' />
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {text('消息总数', 'Total Messages')}
            </CardTitle>
            <div className='rounded-full bg-red-500/10 p-2'>
              <Mail className='h-4 w-4 text-red-500' />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className='mb-1 h-8 w-16' />
                <Skeleton className='h-4 w-24' />
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                  {formatNumber(channelStats?.totalMessages ?? 0)}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {text('已处理消息', 'Processed messages')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{text('成本对比', 'Cost Comparison')}</CardTitle>
            <CardDescription>
              {text('按消息渠道查看成本', 'View costs by channel')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-[300px] w-full' />
            ) : (
              <ChannelComparisonChart channels={channels} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text('全部渠道', 'All Channels')}</CardTitle>
            <CardDescription>
              {text('所有渠道的详细概览', 'Detailed overview of all channels')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-4'>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
            ) : (
              <ChannelsTable channels={channels} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
