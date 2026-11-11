import { useCallback, useEffect, useMemo, useState } from 'react'
import DetailPanel from './components/DetailPanel'
import ProvinceList from './components/ProvinceList'
import BreakHeatmap from './components/BreakHeatmap'
import DateBreakCityList from './components/DateBreakCityList'
import { useI18n } from './i18n/I18nContext'
import './App.css'

const YEAR_OPTIONS = [2025, 2026]

export default function App() {
  const { t } = useI18n()
  const [year, setYear] = useState(2026)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedCode, setSelectedCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heatmapBreakKey, setHeatmapBreakKey] = useState('autumn')
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/data/school-breaks-${year}.json`)
      .then((res) => {
        if (!res.ok) {
          const err = new Error('load-failed')
          err.year = year
          err.status = res.status
          throw err
        }
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json)
        setSelectedCode(json.provinces[0]?.code ?? null)
        setSelectedHeatmapDate(null)
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setData(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [year])

  const selectedProvince = useMemo(() => {
    if (!data) return null
    return data.provinces.find((p) => p.code === selectedCode) ?? null
  }, [data, selectedCode])

  const handleSelect = useCallback((code) => {
    setSelectedCode(code)
  }, [])

  const handleBreakKeyChange = useCallback((key) => {
    setHeatmapBreakKey(key)
    setSelectedHeatmapDate(null)
  }, [])

  const handleYearChange = useCallback((nextYear) => {
    setYear(nextYear)
    setSelectedHeatmapDate(null)
  }, [])

  const errorMessage = useMemo(() => {
    if (!error) return null
    if (error.message === 'load-failed') {
      return t('app.loadDataError', { year: error.year, status: error.status })
    }
    return error.message || t('app.unknownError')
  }, [error, t])

  if (loading) {
    return (
      <div className="app app--loading">
        <p>{t('app.loading')}</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="app app--error">
        <p>
          {t('app.loadFailed')}
          {errorMessage ?? t('app.unknownError')}
        </p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__row">
            <div>
              <h1 className="app-title">{t('app.title')}</h1>
              <p className="app-subtitle">
                {t('app.subtitle', {
                  schoolYear: data.meta.schoolYear,
                  updatedAt: data.meta.datasetUpdatedAt,
                })}
              </p>
            </div>
            <div className="app-header__controls">
              <LanguagePicker />
              <YearPicker year={year} onChange={handleYearChange} />
            </div>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="app-main__heatmap">
          <BreakHeatmap
            provinces={data.provinces}
            breakKey={heatmapBreakKey}
            onBreakKeyChange={handleBreakKeyChange}
            selectedDate={selectedHeatmapDate}
            onSelectDate={setSelectedHeatmapDate}
          />
        </div>
        <div className="app-main__body">
          <ProvinceList
            provinces={data.provinces}
            selectedCode={selectedCode}
            onSelect={handleSelect}
          />
          <div className="content-column content-column--detail">
            {selectedHeatmapDate ? (
              <DateBreakCityList
                provinces={data.provinces}
                breakKey={heatmapBreakKey}
                selectedDate={selectedHeatmapDate}
              />
            ) : (
              <DetailPanel province={selectedProvince} meta={data.meta} />
            )}
          </div>
        </div>
      </main>
      <footer className="app-footer">
        <p>{t('footer.disclaimer')}</p>
      </footer>
    </div>
  )
}

function LanguagePicker() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="language-picker" role="radiogroup" aria-label={t('languagePicker.ariaLabel')}>
      {[
        { value: 'zh', label: t('languagePicker.zh') },
        { value: 'en', label: t('languagePicker.en') },
      ].map(({ value, label }) => (
        <label key={value} className="language-picker__option">
          <input
            type="radio"
            name="ui-locale"
            value={value}
            checked={locale === value}
            onChange={() => setLocale(value)}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  )
}

function YearPicker({ year, onChange }) {
  const { t } = useI18n()

  return (
    <div className="year-picker" role="radiogroup" aria-label={t('yearPicker.ariaLabel')}>
      {YEAR_OPTIONS.map((y) => (
        <label key={y} className="year-picker__option">
          <input
            type="radio"
            name="data-year"
            value={y}
            checked={year === y}
            onChange={() => onChange(y)}
          />
          <span>{y}</span>
        </label>
      ))}
    </div>
  )
}
