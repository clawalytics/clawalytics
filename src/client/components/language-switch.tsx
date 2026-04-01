import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/context/locale-provider'

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale()

  return (
    <div className='flex items-center rounded-full border border-white/12 bg-white/45 p-1 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.72)] backdrop-blur-xl dark:bg-white/8'>
      <Languages className='mx-1 size-4 text-muted-foreground' />
      <Button
        variant={locale === 'zh' ? 'secondary' : 'ghost'}
        size='sm'
        className='h-7 rounded-full px-2.5 text-xs'
        onClick={() => setLocale('zh')}
      >
        中文
      </Button>
      <Button
        variant={locale === 'en' ? 'secondary' : 'ghost'}
        size='sm'
        className='h-7 rounded-full px-2.5 text-xs'
        onClick={() => setLocale('en')}
      >
        English
      </Button>
    </div>
  )
}
