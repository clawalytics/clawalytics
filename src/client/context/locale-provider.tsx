import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getDesktopPreferences,
  updateDesktopPreferences,
} from '@/lib/api'

export type AppLocale = 'zh' | 'en'

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  text: (zh: string, en: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = 'clawalytics-locale'
const COOKIE_KEY = 'clawalytics-locale'

function readLocaleCookie(): AppLocale | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${COOKIE_KEY}=`))

  if (!match) return null

  const value = decodeURIComponent(match.split('=').slice(1).join('='))
  return value === 'zh' || value === 'en' ? value : null
}

function readStoredLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null

  const cookieLocale = readLocaleCookie()
  if (cookieLocale) return cookieLocale

  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === 'zh' || saved === 'en' ? saved : null
}

function persistLocale(locale: AppLocale) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, locale)
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
}

export function getStoredLocale(): AppLocale {
  return readStoredLocale() ?? 'en'
}

export function translateStatic(zh: string, en: string): string {
  return getStoredLocale() === 'zh' ? zh : en
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => getStoredLocale())

  useEffect(() => {
    const stored = readStoredLocale()

    if (stored) {
      persistLocale(stored)
      setLocaleState(stored)
      void updateDesktopPreferences({ locale: stored }).catch(() => undefined)
      return
    }

    void getDesktopPreferences()
      .then((preferences) => {
        persistLocale(preferences.locale)
        setLocaleState(preferences.locale)
      })
      .catch(() => undefined)
  }, [])

  const setLocale = (nextLocale: AppLocale) => {
    setLocaleState(nextLocale)
    persistLocale(nextLocale)
    void updateDesktopPreferences({ locale: nextLocale }).catch(() => undefined)
  }

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      text: (zh: string, en: string) => (locale === 'zh' ? zh : en),
    }),
    [locale]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
