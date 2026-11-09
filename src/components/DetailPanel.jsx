import { breakLabel, formatDateRange } from '../utils/format'

const BREAK_ORDER = ['spring', 'summer', 'autumn', 'winter']

function CityCard({ city }) {
  return (
    <article className="city-card">
      <header className="city-card__header">
        <h3 className="city-card__title">{city.name}</h3>
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
      <aside className="detail-panel detail-panel--empty">
        <h2 className="panel-title">假期详情</h2>
        <p>请从左侧列表或地图中选择已收录省份，查看各市春、夏、秋、寒假安排。</p>
      </aside>
    )
  }

  return (
    <aside className="detail-panel" aria-label="假期详情">
      <header className="detail-panel__header">
        <h2 className="panel-title">{province.name}</h2>
        <p className="panel-hint">
          {meta.schoolYear} 学年 · {province.cities.length} 个城市
        </p>
      </header>
      <div className="city-list">
        {province.cities.map((city) => (
          <CityCard key={city.name} city={city} />
        ))}
      </div>
      <p className="disclaimer">{meta.disclaimer}</p>
    </aside>
  )
}
