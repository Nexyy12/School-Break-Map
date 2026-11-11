import CityBreakCard from './CityBreakCard'

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
          <CityBreakCard key={city.name} city={city} />
        ))}
      </div>
      <p className="disclaimer">{meta.disclaimer}</p>
    </section>
  )
}
