import { useLocale } from '@/context/locale-provider'

export function isWindowsDesktopShell() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return navigator.userAgent.includes('Electron') && navigator.userAgent.includes('Windows')
}

export function DesktopWindowChrome() {
  const { text } = useLocale()

  return (
    <div
      data-desktop-chrome
      className='desktop-drag-region fixed inset-x-0 top-0 z-50 flex h-[var(--desktop-titlebar-height)] items-center border-b backdrop-blur-xl'
      style={{
        backgroundColor: 'var(--desktop-titlebar-bg)',
        borderColor: 'var(--desktop-titlebar-border)',
      }}
    >
      <div className='flex h-full w-full items-center justify-between gap-4 px-4 pe-[var(--desktop-controls-width)]'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex size-8 items-center justify-center rounded-xl border border-white/12 bg-white/10 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.85)]'>
            <img src='/images/logo.png' alt='Clawalytics' className='size-6 object-contain' />
          </div>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold tracking-[0.01em] text-foreground'>
              Clawalytics
            </p>
            <p className='truncate text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
              {text('Windows 桌面版', 'Windows Desktop')}
            </p>
          </div>
        </div>
        <div className='hidden items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-muted-foreground lg:flex'>
          {text('原生窗口控件', 'Native Window Controls')}
        </div>
      </div>
    </div>
  )
}
