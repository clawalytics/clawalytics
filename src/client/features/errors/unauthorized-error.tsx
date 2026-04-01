import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/context/locale-provider'

export function UnauthorisedError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  const { text } = useLocale()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>
          {text('未授权访问', 'Unauthorized Access')}
        </span>
        <p className='text-center text-muted-foreground'>
          {text('请使用正确的身份信息登录，', 'Please log in with the appropriate credentials')}
          <br />
          {text('然后再访问此资源。', 'to access this resource.')}
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
