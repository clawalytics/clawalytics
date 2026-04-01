import { startTransition, useEffect, useState } from 'react'
import { LogOut, Minimize2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLocale } from '@/context/locale-provider'
import { submitDesktopCloseChoice } from '@/lib/api'
import { DESKTOP_CLOSE_REQUESTED_EVENT } from '@/lib/ws'

type CloseChoiceAction = 'tray' | 'quit' | 'cancel'

export function DesktopCloseDialog() {
  const { text } = useLocale()
  const [open, setOpen] = useState(false)
  const [rememberChoice, setRememberChoice] = useState(false)
  const [pendingAction, setPendingAction] = useState<CloseChoiceAction | null>(null)

  useEffect(() => {
    function handleOpen() {
      startTransition(() => {
        setRememberChoice(false)
        setOpen(true)
      })
    }

    window.addEventListener(DESKTOP_CLOSE_REQUESTED_EVENT, handleOpen)
    return () => {
      window.removeEventListener(DESKTOP_CLOSE_REQUESTED_EVENT, handleOpen)
    }
  }, [])

  async function submitChoice(action: CloseChoiceAction) {
    if (pendingAction) {
      return
    }

    setPendingAction(action)

    try {
      await submitDesktopCloseChoice({
        action,
        remember: action === 'cancel' ? false : rememberChoice,
      })

      startTransition(() => {
        setOpen(false)
        setRememberChoice(false)
      })
    } finally {
      setPendingAction(null)
    }
  }

  const isBusy = pendingAction !== null

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          event.preventDefault()
          if (!isBusy) {
            void submitChoice('cancel')
          }
        }}
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
        className='max-w-[min(92vw,38rem)] overflow-hidden border-white/18 bg-transparent p-0 shadow-[0_45px_120px_-36px_rgba(15,23,42,0.62)]'
      >
        <div className='relative overflow-hidden rounded-[30px] border border-white/18 bg-[linear-gradient(160deg,oklch(0.985_0.003_247.858_/_0.82),oklch(0.96_0.01_250_/_0.68))] text-foreground backdrop-blur-3xl dark:bg-[linear-gradient(165deg,oklch(0.21_0.01_260_/_0.86),oklch(0.16_0.01_260_/_0.78))]'>
          <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.12),transparent_40%)]' />

          <div className='relative space-y-6 p-6 sm:p-7'>
            <DialogHeader className='space-y-3 text-left'>
              <div className='flex items-start gap-4'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/18 bg-white/45 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.8)] dark:bg-white/10'>
                  <Sparkles className='size-5 text-foreground/80' />
                </div>
                <div className='space-y-2'>
                  <DialogTitle className='text-xl font-semibold tracking-[0.01em]'>
                    {text('关闭 Clawalytics', 'Close Clawalytics')}
                  </DialogTitle>
                  <DialogDescription className='max-w-lg text-sm leading-6 text-foreground/72 dark:text-foreground/68'>
                    {text(
                      '你希望关闭按钮接下来怎么处理？你可以最小化到托盘，也可以直接退出应用。',
                      'Choose what should happen next. You can send the window to the tray or quit the app completely.'
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='grid gap-3 sm:grid-cols-2'>
              <button
                type='button'
                disabled={isBusy}
                onClick={() => {
                  void submitChoice('tray')
                }}
                className='group flex min-h-32 flex-col items-start justify-between rounded-[24px] border border-white/16 bg-white/55 p-5 text-left shadow-[0_24px_60px_-42px_rgba(15,23,42,0.75)] transition duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white/8 dark:hover:bg-white/12'
              >
                <div className='flex size-11 items-center justify-center rounded-2xl border border-white/18 bg-white/55 text-foreground/85 dark:bg-white/10'>
                  <Minimize2 className='size-5' />
                </div>
                <div className='space-y-1.5'>
                  <p className='text-base font-semibold'>
                    {text('最小化到托盘', 'Minimize to tray')}
                  </p>
                  <p className='text-sm leading-6 text-foreground/68 dark:text-foreground/62'>
                    {text(
                      '窗口会隐藏，但应用继续在后台运行。',
                      'Hide the window and keep Clawalytics running in the background.'
                    )}
                  </p>
                </div>
              </button>

              <button
                type='button'
                disabled={isBusy}
                onClick={() => {
                  void submitChoice('quit')
                }}
                className='group flex min-h-32 flex-col items-start justify-between rounded-[24px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,241,242,0.86))] p-5 text-left shadow-[0_24px_60px_-42px_rgba(127,29,29,0.48)] transition duration-200 hover:-translate-y-0.5 hover:border-rose-200/70 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,228,230,0.92))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/35 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[linear-gradient(180deg,rgba(64,16,22,0.72),rgba(42,12,18,0.9))] dark:hover:bg-[linear-gradient(180deg,rgba(82,24,32,0.78),rgba(54,16,24,0.94))]'
              >
                <div className='flex size-11 items-center justify-center rounded-2xl border border-rose-200/55 bg-white/60 text-rose-600 dark:border-rose-500/18 dark:bg-white/10 dark:text-rose-300'>
                  <LogOut className='size-5' />
                </div>
                <div className='space-y-1.5'>
                  <p className='text-base font-semibold'>
                    {text('退出应用', 'Quit app')}
                  </p>
                  <p className='text-sm leading-6 text-foreground/68 dark:text-foreground/62'>
                    {text(
                      '彻底退出桌面程序，不再继续驻留后台。',
                      'Fully close the desktop app instead of keeping it in the tray.'
                    )}
                  </p>
                </div>
              </button>
            </div>

            <div className='flex flex-col gap-4 border-t border-white/14 pt-4 sm:flex-row sm:items-center sm:justify-between'>
              <label className='flex items-center gap-3 text-sm text-foreground/74'>
                <Checkbox
                  checked={rememberChoice}
                  onCheckedChange={(checked) => {
                    setRememberChoice(checked === true)
                  }}
                  disabled={isBusy}
                  className='border-white/28 bg-white/55 dark:bg-white/10'
                />
                <span>
                  {text('记住我的选择，下次自动处理', 'Remember my choice and use it next time')}
                </span>
              </label>

              <Button
                type='button'
                variant='ghost'
                disabled={isBusy}
                onClick={() => {
                  void submitChoice('cancel')
                }}
                className='h-11 rounded-2xl border border-white/12 bg-white/36 px-5 text-sm shadow-none hover:bg-white/54 dark:bg-white/8 dark:hover:bg-white/12'
              >
                {text('取消', 'Cancel')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
