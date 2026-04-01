import { type ComponentType, type SVGProps, useEffect, useState } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import {
  CircleCheck,
  LogOut,
  Minimize2,
  Power,
  Rocket,
  RotateCcw,
  Settings,
} from 'lucide-react'
import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import {
  getDesktopPreferences,
  updateDesktopPreferences,
  type DesktopPreferences,
  type DesktopStartupMode,
} from '@/lib/api'
import { cn } from '@/lib/utils'
import { useLocale } from '@/context/locale-provider'
import { useDirection } from '@/context/direction-provider'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { isWindowsDesktopShell } from '@/components/layout/desktop-window-chrome'
import { useSidebar } from './ui/sidebar'

const DEFAULT_DESKTOP_SETTINGS: Pick<
  DesktopPreferences,
  'launchOnStartup' | 'startupMode' | 'closeAction'
> = {
  launchOnStartup: false,
  startupMode: 'window',
  closeAction: 'ask',
}

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { text } = useLocale()
  const { resetDir } = useDirection()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()
  const desktopShell = isWindowsDesktopShell()

  const handleReset = () => {
    setOpen(true)
    resetDir()
    resetTheme()
    resetLayout()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          aria-label={text('打开主题设置', 'Open theme settings')}
          aria-describedby='config-drawer-description'
          className='rounded-full'
        >
          <Settings aria-hidden='true' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>{text('界面设置', 'Theme Settings')}</SheetTitle>
          <SheetDescription id='config-drawer-description'>
            {text(
              '调整界面外观和布局，按你的偏好进行显示。',
              'Adjust the appearance and layout to suit your preferences.'
            )}
          </SheetDescription>
        </SheetHeader>
        <div className='space-y-6 overflow-y-auto px-4'>
          {desktopShell && <DesktopConfig />}
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <DirConfig />
        </div>
        <SheetFooter className='gap-2'>
          <Button
            variant='destructive'
            onClick={handleReset}
            aria-label={text('将所有设置重置为默认值', 'Reset all settings to default values')}
          >
            {text('重置', 'Reset')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DesktopConfig() {
  const { text } = useLocale()
  const [preferences, setPreferences] = useState<DesktopPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPreferences() {
      try {
        const nextPreferences = await getDesktopPreferences()
        if (!cancelled) {
          setPreferences(nextPreferences)
        }
      } catch (error) {
        console.error('Failed to load desktop preferences:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadPreferences()

    return () => {
      cancelled = true
    }
  }, [])

  async function savePreferences(updates: Partial<DesktopPreferences>) {
    setIsSaving(true)

    try {
      const nextPreferences = await updateDesktopPreferences(updates)
      setPreferences(nextPreferences)
    } catch (error) {
      console.error('Failed to save desktop preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const launchOnStartup = preferences?.launchOnStartup ?? false
  const startupMode = preferences?.startupMode ?? DEFAULT_DESKTOP_SETTINGS.startupMode
  const closeAction = preferences?.closeAction ?? DEFAULT_DESKTOP_SETTINGS.closeAction
  const controlsDisabled = isLoading || isSaving || !preferences
  const hasCustomSettings =
    launchOnStartup
    || startupMode !== DEFAULT_DESKTOP_SETTINGS.startupMode
    || closeAction !== DEFAULT_DESKTOP_SETTINGS.closeAction

  return (
    <div>
      <SectionTitle
        title={text('桌面', 'Desktop')}
        showReset={hasCustomSettings}
        onReset={() => {
          void savePreferences(DEFAULT_DESKTOP_SETTINGS)
        }}
      />
      <div className='space-y-3 rounded-2xl border border-border/70 bg-muted/15 p-4'>
        <div className='flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-background/70 p-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Power className='size-4 text-muted-foreground' />
              <span>{text('开机自启', 'Launch at startup')}</span>
            </div>
            <p className='text-xs leading-5 text-muted-foreground'>
              {text(
                '登录 Windows 后自动启动 Clawalytics。',
                'Automatically start Clawalytics after you sign in to Windows.'
              )}
            </p>
          </div>
          <Switch
            checked={launchOnStartup}
            disabled={controlsDisabled}
            onCheckedChange={(checked) => {
              void savePreferences({ launchOnStartup: checked === true })
            }}
            aria-label={text('切换开机自启', 'Toggle launch at startup')}
          />
        </div>

        <DesktopSelectField
          icon={Rocket}
          label={text('启动方式', 'Startup mode')}
          description={text(
            '选择开机自启时显示主窗口，还是静默启动到托盘。',
            'Choose whether startup opens the main window or stays quietly in the tray.'
          )}
          value={startupMode}
          disabled={controlsDisabled || !launchOnStartup}
          onValueChange={(value) => {
            void savePreferences({ startupMode: value as DesktopStartupMode })
          }}
          placeholder={text('选择启动方式', 'Select startup mode')}
          options={[
            {
              value: 'window',
              label: text('显示主窗口', 'Open main window'),
            },
            {
              value: 'tray',
              label: text('最小化到托盘', 'Start in tray'),
            },
          ]}
        />

        <DesktopSelectField
          icon={Minimize2}
          label={text('关闭按钮行为', 'Close button action')}
          description={text(
            '选择点击窗口关闭按钮时，是询问、最小化到托盘，还是直接退出。',
            'Choose whether closing the window asks first, minimizes to the tray, or quits immediately.'
          )}
          value={closeAction}
          disabled={controlsDisabled}
          onValueChange={(value) => {
            void savePreferences({
              closeAction: value as DesktopPreferences['closeAction'],
            })
          }}
          placeholder={text('选择关闭行为', 'Select close behavior')}
          options={[
            {
              value: 'ask',
              label: text('每次都询问', 'Ask every time'),
            },
            {
              value: 'tray',
              label: text('最小化到托盘', 'Minimize to tray'),
            },
            {
              value: 'quit',
              label: text('直接退出', 'Quit app'),
            },
          ]}
          actionIcon={closeAction === 'quit' ? LogOut : Minimize2}
        />

        {!launchOnStartup && (
          <p className='px-1 text-xs leading-5 text-muted-foreground'>
            {text(
              '打开“开机自启”后，就可以设置启动时直接显示窗口还是停留在托盘。',
              'Turn on launch at startup to choose whether Clawalytics opens its window or stays in the tray.'
            )}
          </p>
        )}
      </div>
    </div>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function DesktopSelectField({
  icon: Icon,
  actionIcon: ActionIcon,
  label,
  description,
  value,
  disabled,
  onValueChange,
  placeholder,
  options,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  actionIcon?: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  description: string
  value: string
  disabled: boolean
  onValueChange: (value: string) => void
  placeholder: string
  options: Array<{ label: string; value: string }>
}) {
  const ActiveIcon = ActionIcon ?? Icon

  return (
    <div className='rounded-xl border border-border/60 bg-background/70 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <Icon className='size-4 text-muted-foreground' />
            <span>{label}</span>
          </div>
          <p className='text-xs leading-5 text-muted-foreground'>{description}</p>
        </div>
        <div className='flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/30 text-muted-foreground'>
          <ActiveIcon className='size-4' />
        </div>
      </div>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className='mt-3 w-full bg-background/80'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs'
        id={`${item.value}-description`}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  const { text } = useLocale()
  return (
    <div>
      <SectionTitle
        title={text('主题', 'Theme')}
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={text('选择主题偏好', 'Select theme preference')}
        aria-describedby='theme-description'
      >
        {[
          {
            value: 'system',
            label: text('跟随系统', 'System'),
            icon: IconThemeSystem,
          },
          {
            value: 'light',
            label: text('浅色', 'Light'),
            icon: IconThemeLight,
          },
          {
            value: 'dark',
            label: text('深色', 'Dark'),
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
      <div id='theme-description' className='sr-only'>
        {text(
          '选择跟随系统、浅色模式或深色模式',
          'Choose between system preference, light mode, or dark mode'
        )}
      </div>
    </div>
  )
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  const { text } = useLocale()
  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title={text('侧边栏', 'Sidebar')}
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={text('选择侧边栏样式', 'Select sidebar style')}
        aria-describedby='sidebar-description'
      >
        {[
          {
            value: 'inset',
            label: text('内嵌', 'Inset'),
            icon: IconSidebarInset,
          },
          {
            value: 'floating',
            label: text('悬浮', 'Floating'),
            icon: IconSidebarFloating,
          },
          {
            value: 'sidebar',
            label: text('标准侧边栏', 'Sidebar'),
            icon: IconSidebarSidebar,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id='sidebar-description' className='sr-only'>
        {text(
          '选择内嵌、悬浮或标准侧边栏布局',
          'Choose between inset, floating, or standard sidebar layout'
        )}
      </div>
    </div>
  )
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()
  const { text } = useLocale()

  const radioState = open ? 'default' : collapsible

  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title={text('布局', 'Layout')}
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(v as Collapsible)
        }}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={text('选择布局样式', 'Select layout style')}
        aria-describedby='layout-description'
      >
        {[
          {
            value: 'default',
            label: text('默认', 'Default'),
            icon: IconLayoutDefault,
          },
          {
            value: 'icon',
            label: text('紧凑', 'Compact'),
            icon: IconLayoutCompact,
          },
          {
            value: 'offcanvas',
            label: text('完整布局', 'Full layout'),
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id='layout-description' className='sr-only'>
        {text(
          '选择默认展开、紧凑图标模式或完整布局模式',
          'Choose between default expanded, compact icon-only, or full layout mode'
        )}
      </div>
    </div>
  )
}

function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection()
  const { text } = useLocale()
  return (
    <div>
      <SectionTitle
        title={text('方向', 'Direction')}
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={text('选择页面方向', 'Select site direction')}
        aria-describedby='direction-description'
      >
        {[
          {
            value: 'ltr',
            label: text('从左到右', 'Left to Right'),
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir='ltr' {...props} />
            ),
          },
          {
            value: 'rtl',
            label: text('从右到左', 'Right to Left'),
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir='rtl' {...props} />
            ),
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id='direction-description' className='sr-only'>
        {text(
          '选择从左到右或从右到左的页面方向',
          'Choose between left-to-right or right-to-left site direction'
        )}
      </div>
    </div>
  )
}
