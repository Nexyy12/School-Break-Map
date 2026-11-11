import { formatDateRange } from '../utils/format'
import { useI18n } from '../i18n/I18nContext'

const BREAK_ORDER = ['spring', 'summer', 'autumn', 'winter']

function cityHasUncertainBreaks(city) {
  return BREAK_ORDER.some((key) => city.breaks?.[key]?.uncertain)
}

export default function CityBreakCard({ city, provinceName }) {
  const { t, locale, seasonLabel } = useI18n()

  return (
    <article className="city-card">
      <header className="city-card__header">
        <h3 className="city-card__title">
          {city.name}
          {provinceName ? (
            <span
              className="city-card__province"
              aria-label={t('cityCard.provinceAria', { name: provinceName })}
            >
              {provinceName}
            </span>
          ) : null}
        </h3>
        {cityHasUncertainBreaks(city) && (
          <span className="badge badge--multi">{t('cityCard.badgeMulti')}</span>
        )}
        {city.illustrative && (
          <span className="badge badge--warn">{t('cityCard.badgeUncertain')}</span>
        )}
      </header>
      <dl className="break-grid">
        {BREAK_ORDER.map((key) => {
          const b = city.breaks[key]
          return (
            <div key={key} className="break-grid__row">
              <dt>{seasonLabel(key)}</dt>
              <dd>
                <span className="break-dates">
                  {formatDateRange(b.start, b.end, locale, t)}
                </span>
                {b.note && <span className="break-note">{b.note}</span>}
              </dd>
            </div>
          )
        })}
      </dl>
      <footer className="city-card__footer">
        <span className="meta">{t('cityCard.updated', { date: city.updatedAt })}</span>
        <a href={city.source} target="_blank" rel="noopener noreferrer">
          {t('cityCard.sourceLink')}
        </a>
      </footer>
    </article>
  )
}
