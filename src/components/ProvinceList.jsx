export default function ProvinceList({ provinces, selectedCode, onSelect }) {
  return (
    <aside className="province-list" aria-label="省份列表">
      <h2 className="panel-title">已收录省份</h2>
      <p className="panel-hint">共 {provinces.length} 个省级行政区（演示种子数据）</p>
      <ul className="province-list__items">
        {provinces.map((p) => (
          <li key={p.code}>
            <button
              type="button"
              className={`province-list__btn${selectedCode === p.code ? ' is-active' : ''}`}
              onClick={() => onSelect(p.code)}
              aria-current={selectedCode === p.code ? 'true' : undefined}
            >
              <span className="province-list__name">{p.name}</span>
              <span className="province-list__meta">{p.cities.length} 个城市</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
