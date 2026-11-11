import { useMemo } from 'react'
import { citiesOnBreakForDay } from '../utils/heatmap'
import { useI18n } from '../i18n/I18nContext'
import {
  getCityDisplayName,
  getProvinceDisplayNameByCode,
} from '../utils/placeNames'
import CityBreakCard from './CityBreakCard'

export default function DateBreakCityList({ provinces, breakKey, selectedDate }) {
  const { t, seasonLabel, locale } = useI18n()
  const entries = useMemo(() => {
    const list = citiesOnBreakForDay(breakKey, provinces, selectedDate)
    if (locale !== 'en') return list
    return [...list].sort((a, b) => {
      const byProvince = getProvinceDisplayNameByCode(
        a.provinceCode,
        a.provinceName,
        locale,
      ).localeCompare(
        getProvinceDisplayNameByCode(b.provinceCode, b.provinceName, locale),
        'en',
      )
      if (byProvince !== 0) return byProvince
      return getCityDisplayName(a.city, locale).localeCompare(
        getCityDisplayName(b.city, locale),
        'en',
      )
    })
  }, [breakKey, provinces, selectedDate, locale])

  return (
    <section className="date-break-list" aria-label={t('dateBreakList.ariaLabel')}>
      <header className="date-break-list__head">
        <h2 className="panel-title">{t('dateBreakList.title')}</h2>
        <p className="date-break-list__meta">
          <span className="date-break-list__date">{selectedDate}</span>
          <span aria-hidden="true"> · </span>
          <span>{seasonLabel(breakKey)}</span>
          <span aria-hidden="true"> · </span>
          <span>{t('dateBreakList.nationalOnBreak', { count: entries.length })}</span>
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="date-break-list__empty">{t('dateBreakList.empty')}</p>
      ) : (
        <div className="city-list city-list--scrollable">
          {entries.map(({ provinceCode: code, provinceName, city }) => (
            <CityBreakCard
              key={`${code}-${city.name}`}
              city={city}
              provinceCode={code}
              provinceName={provinceName}
            />
          ))}
        </div>
      )}
    </section>
  )
}
