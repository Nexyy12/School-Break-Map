import { breakLabel, formatDateRange } from '../utils/format'

const BREAK_ORDER = ['spring', 'summer', 'autumn', 'winter']

function cityHasUncertainBreaks(city) {
  return BREAK_ORDER.some((key) => city.breaks?.[key]?.uncertain)
}

export default function CityBreakCard({ city, provinceName }) {
  return (
    <article className="city-card">
      <header className="city-card__header">
        <h3 className="city-card__title">
          {city.name}
          {provinceName ? (
            <span className="city-card__province" aria-label={`所属省份：${provinceName}`}>
              {provinceName}
            </span>
          ) : null}
        </h3>
        {cityHasUncertainBreaks(city) && (
          <span className="badge badge--multi">多批次</span>
        )}
        {city.illustrative && <span className="badge badge--warn">待核对</span>}
      </header>
      <dl className="break-grid">
        {BREAK_ORDER.map((key) => {
          const b = city.breaks[key]
          return (
            <div key={key} className="break-grid__row">
              <dt>{breakLabel(key)}</dt>
              <dd>
                <span className="break-dates">{formatDateRange(b.start, b.end)}</span>
                {b.note && <span className="break-note">{b.note}</span>}
              </dd>
            </div>
          )
        })}
      </dl>
      <footer className="city-card__footer">
        <span className="meta">更新：{city.updatedAt}</span>
        <a href={city.source} target="_blank" rel="noopener noreferrer">
          来源链接
        </a>
      </footer>
    </article>
  )
}
