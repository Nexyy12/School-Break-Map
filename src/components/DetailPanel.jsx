import { breakLabel, formatDateRange } from '../utils/format'

const BREAK_ORDER = ['spring', 'summer', 'autumn', 'winter']

function cityHasUncertainBreaks(city) {
  return BREAK_ORDER.some((key) => city.breaks?.[key]?.uncertain)
}

function CityCard({ city }) {
  return (
    <article className="city-card">
      <header className="city-card__header">
        <h3 className="city-card__title">{city.name}</h3>
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

export default function DetailPanel({ province, meta }) {
  if (!province) {
    return (
      <section className="detail-panel detail-panel--empty" aria-label="假期详情">
        <p className="detail-panel__placeholder">请从左侧列表选择已收录省份，查看各市春、夏、秋、寒假安排。</p>
      </section>
    )
  }

  return (
    <section className="detail-panel" aria-label="假期详情">
      <div className="city-list">
        {province.cities.map((city) => (
          <CityCard key={city.name} city={city} />
        ))}
      </div>
      <p className="disclaimer">{meta.disclaimer}</p>
    </section>
  )
}
