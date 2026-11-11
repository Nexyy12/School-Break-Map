import { useI18n } from '../i18n/I18nContext'

const GROUPS = [
  {
    key: 'SH',
    provinces: (list) => list.filter((p) => p.code === 'SH'),
  },
  {
    key: 'NP',
    provinces: (list) => list.filter((p) => p.code === 'JS' || p.code === 'ZJ'),
  },
  {
    key: 'OC',
    provinces: (list) => list.filter((p) => !['SH', 'JS', 'ZJ'].includes(p.code)),
  },
]

function ProvinceItems({ provinces, selectedCode, onSelect }) {
  const { t } = useI18n()

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
            <span className="province-list__meta">
              {t('provinceList.cityCount', { count: p.cities.length })}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function ProvinceList({ provinces, selectedCode, onSelect }) {
  const { t } = useI18n()

  return (
    <aside className="province-list" aria-label={t('provinceList.ariaLabel')}>
      <h2 className="panel-title">{t('provinceList.title')}</h2>
      <p className="panel-hint">
        {t('provinceList.hint', { count: provinces.length })}
      </p>
      {GROUPS.map((group) => {
        const items = group.provinces(provinces)
        if (!items.length) return null
        return (
          <section
            key={group.key}
            className="province-list__section"
            aria-labelledby={`group-${group.key}`}
          >
            <h3 id={`group-${group.key}`} className="province-list__section-title">
              {t(`provinceList.groups.${group.key}`)}
            </h3>
            <ProvinceItems
              provinces={items}
              selectedCode={selectedCode}
              onSelect={onSelect}
            />
          </section>
        )
      })}
    </aside>
  )
}
