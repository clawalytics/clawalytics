import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DollarSign, Loader2, Save } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useLocale } from '@/context/locale-provider'
import {
  getBudgetStatus,
  getConfig,
  updateConfig,
  type BudgetPeriod,
} from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'

export function BudgetPage() {
  const { text } = useLocale()
  const queryClient = useQueryClient()

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
  })

  const { data: budgetStatus, isLoading: budgetLoading } = useQuery({
    queryKey: ['budgetStatus'],
    queryFn: getBudgetStatus,
    refetchInterval: 10000,
  })

  const [daily, setDaily] = useState('')
  const [weekly, setWeekly] = useState('')
  const [monthly, setMonthly] = useState('')
  const [dailyEnabled, setDailyEnabled] = useState(true)
  const [weeklyEnabled, setWeeklyEnabled] = useState(true)
  const [monthlyEnabled, setMonthlyEnabled] = useState(true)

  useEffect(() => {
    if (!config) return

    const thresholds = config.alertThresholds
    setDaily(thresholds.dailyBudget > 0 ? thresholds.dailyBudget.toString() : '')
    setWeekly(
      thresholds.weeklyBudget > 0 ? thresholds.weeklyBudget.toString() : ''
    )
    setMonthly(
      thresholds.monthlyBudget > 0 ? thresholds.monthlyBudget.toString() : ''
    )
    setDailyEnabled(thresholds.dailyBudget > 0)
    setWeeklyEnabled(thresholds.weeklyBudget > 0)
    setMonthlyEnabled(thresholds.monthlyBudget > 0)
  }, [config])

  const mutation = useMutation({
    mutationFn: (thresholds: {
      dailyBudget: number
      weeklyBudget: number
      monthlyBudget: number
    }) => updateConfig({ alertThresholds: thresholds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
      queryClient.invalidateQueries({ queryKey: ['budgetStatus'] })
      toast.success(text('预算已更新', 'Budget updated'))
    },
    onError: () => {
      toast.error(text('预算更新失败', 'Failed to update budget'))
    },
  })

  const handleSave = () => {
    mutation.mutate({
      dailyBudget: dailyEnabled ? (parseFloat(daily) || 0) : 0,
      weeklyBudget: weeklyEnabled ? (parseFloat(weekly) || 0) : 0,
      monthlyBudget: monthlyEnabled ? (parseFloat(monthly) || 0) : 0,
    })
  }

  const hasChanges = config
    ? (dailyEnabled ? (parseFloat(daily) || 0) : 0) !==
        config.alertThresholds.dailyBudget ||
      (weeklyEnabled ? (parseFloat(weekly) || 0) : 0) !==
        config.alertThresholds.weeklyBudget ||
      (monthlyEnabled ? (parseFloat(monthly) || 0) : 0) !==
        config.alertThresholds.monthlyBudget
    : false

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <DollarSign className='h-6 w-6' />
          <span className='font-jersey text-xl'>{text('预算', 'Budget')}</span>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold tracking-tight'>
            {text('预算', 'Budget')}
          </h1>
          <p className='text-muted-foreground'>
            {text(
              '设置花费上限并跟踪预算使用情况',
              'Set spending limits and track budget usage'
            )}
          </p>
        </div>

        {budgetLoading ? (
          <div className='mb-6 grid gap-4 sm:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-24 w-full' />
            ))}
          </div>
        ) : budgetStatus &&
          (budgetStatus.daily || budgetStatus.weekly || budgetStatus.monthly) ? (
          <div className='mb-6 grid gap-4 sm:grid-cols-3'>
            {budgetStatus.daily && (
              <BudgetBar
                label={text('日预算', 'Daily Budget')}
                period={budgetStatus.daily}
              />
            )}
            {budgetStatus.weekly && (
              <BudgetBar
                label={text('周预算', 'Weekly Budget')}
                period={budgetStatus.weekly}
              />
            )}
            {budgetStatus.monthly && (
              <BudgetBar
                label={text('月预算', 'Monthly Budget')}
                period={budgetStatus.monthly}
              />
            )}
          </div>
        ) : (
          <Card className='mb-6'>
            <CardContent className='pt-6'>
              <p className='text-center text-sm text-muted-foreground'>
                {text(
                  '还没有配置预算，请在下方设置额度。',
                  'No budget configured yet. Set your limits below.'
                )}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{text('预算限制', 'Budget Limits')}</CardTitle>
            <CardDescription>
              {text(
                '设置预算告警阈值。关闭某个周期即可停用对应提醒。',
                'Set budget alert thresholds. Disable a period to turn off its reminders.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {configLoading ? (
              <div className='space-y-6'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
            ) : (
              <div className='space-y-6'>
                <BudgetRow
                  label={text('每日', 'Daily')}
                  value={daily}
                  enabled={dailyEnabled}
                  onValueChange={setDaily}
                  onEnabledChange={setDailyEnabled}
                />
                <BudgetRow
                  label={text('每周', 'Weekly')}
                  value={weekly}
                  enabled={weeklyEnabled}
                  onValueChange={setWeekly}
                  onEnabledChange={setWeeklyEnabled}
                />
                <BudgetRow
                  label={text('每月', 'Monthly')}
                  value={monthly}
                  enabled={monthlyEnabled}
                  onValueChange={setMonthly}
                  onEnabledChange={setMonthlyEnabled}
                />

                <div className='flex justify-end pt-2'>
                  <Button
                    onClick={handleSave}
                    disabled={mutation.isPending || !hasChanges}
                  >
                    {mutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Save className='mr-2 h-4 w-4' />
                    )}
                    {text('保存', 'Save')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

function BudgetRow({
  label,
  value,
  enabled,
  onValueChange,
  onEnabledChange,
}: {
  label: string
  value: string
  enabled: boolean
  onValueChange: (v: string) => void
  onEnabledChange: (v: boolean) => void
}) {
  const { text } = useLocale()

  return (
    <div className='flex items-center gap-4'>
      <Label className='w-20 text-sm font-medium'>{label}</Label>
      <div className='relative max-w-[200px] flex-1'>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
          $
        </span>
        <Input
          type='number'
          min='0'
          step='0.01'
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={!enabled}
          className='pl-7'
          placeholder='0.00'
        />
      </div>
      <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      <span className='w-16 text-sm text-muted-foreground'>
        {enabled ? text('启用', 'Enabled') : text('关闭', 'Disabled')}
      </span>
    </div>
  )
}

function BudgetBar({
  label,
  period,
}: {
  label: string
  period: BudgetPeriod
}) {
  const { text } = useLocale()

  const color =
    period.percent >= 90
      ? 'bg-red-500'
      : period.percent >= 70
        ? 'bg-yellow-500'
        : 'bg-green-500'

  const textColor =
    period.percent >= 90
      ? 'text-red-600 dark:text-red-400'
      : period.percent >= 70
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-green-600 dark:text-green-400'

  return (
    <Card className='p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-sm font-medium'>{label}</span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {formatCurrency(period.spent)} / {formatCurrency(period.budget)}
        </span>
      </div>
      <div className='relative h-2 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className={`h-full transition-all ${color}`}
          style={{ width: `${Math.min(100, period.percent)}%` }}
        />
      </div>
      <p className='mt-1 text-xs text-muted-foreground'>
        {text(
          `已使用 ${period.percent.toFixed(0)}%`,
          `Used ${period.percent.toFixed(0)}%`
        )}
      </p>
    </Card>
  )
}
