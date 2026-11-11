import { useMemo } from 'react'
import { breakLabel } from '../utils/format'
import { citiesOnBreakForDay } from '../utils/heatmap'

export default function DateBreakCityList({ provinces, breakKey, selectedDate }) {
  const entries = useMemo(
    () => citiesOnBreakForDay(breakKey, provinces, selectedDate),
    [breakKey, provinces, selectedDate],
  )

  return (
    <section className="date-break-list" aria-label="选定日期放假城市">
      <header className="date-break-list__head">
        <h2 className="panel-title">选定日期放假城市</h2>
        <p className="date-break-list__meta">
          <span className="date-break-list__date">{selectedDate}</span>
          <span aria-hidden="true"> · </span>
          <span>{breakLabel(breakKey)}</span>
          <span aria-hidden="true"> · </span>
          <span>全国</span>
          <span aria-hidden="true"> · </span>
          <strong>{entries.length}</strong> 个城市在假
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="date-break-list__empty">
          全国在本日没有城市处于所选假期类型内的放假区间。
        </p>
      ) : (
        <ul className="date-break-list__grid">
          {entries.map(({ provinceCode: code, provinceName: pName, city }) => (
            <li key={`${code}-${city.name}`} className="date-break-list__item">
              <span className="date-break-list__city">
                {city.name}
                <span aria-hidden="true"> · </span>
                <span className="date-break-list__province">{pName}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
