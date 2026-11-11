import CityBreakCard from './CityBreakCard'
import { useI18n } from '../i18n/I18nContext'

export default function DetailPanel({ province, meta }) {
  const { t, locale } = useI18n()

  if (!province) {
    return (
      <section className="detail-panel detail-panel--empty" aria-label={t('detailPanel.ariaLabel')}>
        <p className="detail-panel__placeholder">{t('detailPanel.placeholder')}</p>
      </section>
    )
  }

  const disclaimer =
    locale === 'zh' ? meta.disclaimer : t('detail.disclaimer')

  return (
    <section className="detail-panel" aria-label={t('detailPanel.ariaLabel')}>
      <div className="city-list">
        {province.cities.map((city) => (
          <CityBreakCard key={city.name} city={city} />
        ))}
      </div>
      <p className="disclaimer">{disclaimer}</p>
    </section>
  )
}
