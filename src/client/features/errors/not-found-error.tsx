import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/context/locale-provider'

export function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  const { text } = useLocale()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>404</h1>
        <span className='font-medium'>
          {text('页面不存在。', 'Oops! Page Not Found!')}
        </span>
        <p className='text-center text-muted-foreground'>
          {text('你访问的页面可能不存在，', "It seems like the page you're looking for")}
          <br />
          {text('或者已经被移除。', 'does not exist or might have been removed.')}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            {text('返回上一页', 'Go Back')}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            {text('返回首页', 'Back to Home')}
          </Button>
        </div>
      </div>
    </div>
  )
}
