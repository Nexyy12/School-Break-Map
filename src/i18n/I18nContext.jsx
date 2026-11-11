import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import zh from '../locales/zh.json'
import en from '../locales/en.json'

const STORAGE_KEY = 'school-break-map-locale'

const MESSAGES = { zh, en }

const I18nContext = createContext(null)

function getMessage(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function interpolate(template, vars = {}) {
  if (typeof template !== 'string') return template != null ? String(template) : ''
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : '',
  )
}

function readStoredLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  return 'zh'
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale)

  const setLocale = useCallback((next) => {
    if (next !== 'zh' && next !== 'en') return
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (path, vars) => {
      const raw =
        getMessage(MESSAGES[locale], path) ??
        getMessage(MESSAGES.zh, path) ??
        path
      return interpolate(raw, vars)
    },
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      seasonLabel: (key) => t(`season.${key}`),
    }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
