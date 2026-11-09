const GROUPS = [
  {
    key: 'SH',
    title: 'SH',
    provinces: (list) => list.filter((p) => p.code === 'SH'),
  },
  {
    key: 'NP',
    title: 'NP (Nearby Province)',
    provinces: (list) => list.filter((p) => p.code === 'JS' || p.code === 'ZJ'),
  },
  {
    key: 'OC',
    title: 'OC (Other China)',
    provinces: (list) => list.filter((p) => !['SH', 'JS', 'ZJ'].includes(p.code)),
  },
]

function ProvinceItems({ provinces, selectedCode, onSelect }) {
  return (
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
  )
}

export default function ProvinceList({ provinces, selectedCode, onSelect }) {
  return (
    <aside className="province-list" aria-label="省份列表">
      <h2 className="panel-title">已收录省份</h2>
      <p className="panel-hint">共 {provinces.length} 个省级行政区（演示种子数据）</p>
      {GROUPS.map((group) => {
        const items = group.provinces(provinces)
        if (!items.length) return null
        return (
          <section key={group.key} className="province-list__section" aria-labelledby={`group-${group.key}`}>
            <h3 id={`group-${group.key}`} className="province-list__section-title">
              {group.title}
            </h3>
            <ProvinceItems provinces={items} selectedCode={selectedCode} onSelect={onSelect} />
          </section>
        )
      })}
    </aside>
  )
}
