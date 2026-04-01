import { Button } from '@/components/ui/button'
import { useLocale } from '@/context/locale-provider'

export function MaintenanceError() {
  const { text } = useLocale()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>503</h1>
        <span className='font-medium'>
          {text('站点正在维护中。', 'Website is under maintenance!')}
        </span>
        <p className='text-center text-muted-foreground'>
          {text('当前暂时无法访问。', 'The site is not available at the moment.')}
          <br />
          {text('我们会尽快恢复服务。', "We'll be back online shortly.")}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline'>{text('了解更多', 'Learn more')}</Button>
        </div>
      </div>
    </div>
  )
}
