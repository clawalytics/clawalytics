import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/context/locale-provider'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  const { text } = useLocale()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>{text('禁止访问', 'Access Forbidden')}</span>
        <p className='text-center text-muted-foreground'>
          {text('你没有查看此资源所需的权限。', "You don't have necessary permission")}
          <br />
          {text('请联系管理员获取访问权限。', 'to view this resource.')}
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
