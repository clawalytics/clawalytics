import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Clock, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/context/locale-provider'
import { type PairingRequest, respondToPairingRequest } from '@/lib/api'
import { formatRelativeTime } from '@/lib/i18n'
import { toast } from 'sonner'

interface PairingRequestsProps {
  requests: PairingRequest[]
  isLoading: boolean
}

PairingRequests.displayName = 'PairingRequests'

export function PairingRequests({
  requests,
  isLoading,
}: PairingRequestsProps) {
  const { locale, text } = useLocale()
  const queryClient = useQueryClient()

  const respondMutation = useMutation({
    mutationFn: ({
      id,
      status,
      response,
    }: {
      id: number
      status: string
      response?: string
    }) => respondToPairingRequest(id, status, response),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] })
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['securityDashboard'] })
      toast.success(
        variables.status === 'approved'
          ? text('设备已配对', 'Device paired')
          : text('请求已拒绝', 'Request denied')
      )
    },
    onError: () => {
      toast.error(text('处理请求失败', 'Error processing request'))
    },
  })

  const handleApprove = (id: number) => {
    respondMutation.mutate({ id, status: 'approved' })
  }

  const handleDeny = (id: number) => {
    respondMutation.mutate({
      id,
      status: 'denied',
      response: 'Manually denied',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-4 w-48' />
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(2)].map((_, i) => (
              <div key={i} className='flex items-center gap-4 rounded-lg border p-4'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <div className='flex gap-2'>
                  <Skeleton className='h-8 w-24' />
                  <Skeleton className='h-8 w-24' />
                </div>
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
          <Clock className='h-5 w-5' />
          {text('待处理配对请求', 'Pending Pairing Requests')}
        </CardTitle>
        <CardDescription>
          {requests.length > 0
            ? text(
                `${requests.length} 条请求待处理`,
                `${requests.length} request${requests.length !== 1 ? 's' : ''} pending`
              )
            : text('没有待处理请求', 'No pending requests')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Smartphone className='mb-4 h-12 w-12 text-muted-foreground' />
            <p className='text-lg font-medium text-muted-foreground'>
              {text('没有待处理请求', 'No pending requests')}
            </p>
            <p className='text-sm text-muted-foreground'>
              {text('新的配对请求会显示在这里', 'New pairing requests will appear here')}
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {requests.map((request) => (
              <div
                key={request.id}
                className='flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/5'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <Smartphone className='h-5 w-5' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>
                      {request.device_name ?? text('未命名设备', 'Unnamed Device')}
                    </span>
                    <Badge variant='outline' className='text-xs'>
                      {request.status}
                    </Badge>
                  </div>
                  <div className='mt-1 flex items-center gap-2'>
                    <span className='font-mono text-xs text-muted-foreground'>
                      {request.device_id.slice(0, 12)}...
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {text('请求于', 'Requested')}{' '}
                      {formatRelativeTime(request.requested_at, locale)}
                    </span>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={() => handleApprove(request.id)}
                    disabled={respondMutation.isPending}
                  >
                    <Check className='mr-1 h-4 w-4' />
                    {text('批准', 'Approve')}
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDeny(request.id)}
                    disabled={respondMutation.isPending}
                  >
                    <X className='mr-1 h-4 w-4' />
                    {text('拒绝', 'Deny')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
