import { useMemo } from 'react'
import { citiesOnBreakForDay } from '../utils/heatmap'
import { useI18n } from '../i18n/I18nContext'
import CityBreakCard from './CityBreakCard'

export default function DateBreakCityList({ provinces, breakKey, selectedDate }) {
  const { t, seasonLabel } = useI18n()
  const entries = useMemo(
    () => citiesOnBreakForDay(breakKey, provinces, selectedDate),
    [breakKey, provinces, selectedDate],
  )

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
              provinceName={provinceName}
            />
          ))}
        </div>
      )}
    </section>
  )
}
