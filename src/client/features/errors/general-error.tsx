import { useNavigate, useRouter } from '@tanstack/react-router'
import { useLocale } from '@/context/locale-provider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()
  const { text } = useLocale()
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] leading-tight font-bold'>500</h1>
        )}
        <span className='font-medium'>
          {text('糟糕，出错了。', "Oops! Something went wrong")}
        </span>
        <p className='text-center text-muted-foreground'>
          {text('给你带来不便了。', 'We apologize for the inconvenience.')}
          <br />
          {text('请稍后再试。', 'Please try again later.')}
        </p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => history.go(-1)}>
              {text('返回上一页', 'Go Back')}
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>
              {text('返回首页', 'Back to Home')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
