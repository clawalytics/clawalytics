import { format, formatDistanceToNow, type Locale as DateFnsLocale } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { getStoredLocale, type AppLocale } from '@/context/locale-provider'

function resolveLocale(locale?: AppLocale): AppLocale {
  return locale ?? getStoredLocale()
}

function normalizeDate(date: Date | string): Date | null {
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? null : value
}

export function getDateFnsLocale(locale?: AppLocale): DateFnsLocale {
  return resolveLocale(locale) === 'zh' ? zhCN : enUS
}

export const appLocale = getDateFnsLocale()

export function formatRelativeTime(
  date: Date | string,
  locale?: AppLocale
): string {
  const value = normalizeDate(date)
  if (!value) return '--'

  return formatDistanceToNow(value, {
    addSuffix: true,
    locale: getDateFnsLocale(locale),
  })
}

export function formatDate(
  date: Date | string,
  pattern = 'yyyy/MM/dd',
  locale?: AppLocale
): string {
  const value = normalizeDate(date)
  if (!value) return '--'

  return format(value, pattern, { locale: getDateFnsLocale(locale) })
}

export function formatDurationCompact(
  hours: number,
  minutes: number,
  locale?: AppLocale
): string {
  if (resolveLocale(locale) === 'zh') {
    if (hours > 0) return minutes > 0 ? `${hours}小时 ${minutes}分钟` : `${hours}小时`
    if (minutes > 0) return `${minutes}分钟`
    return '少于 1 分钟'
  }

  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return '<1m'
}

export function formatDurationZh(hours: number, minutes: number): string {
  return formatDurationCompact(hours, minutes, 'zh')
}
