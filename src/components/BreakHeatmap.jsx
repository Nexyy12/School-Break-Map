import { useMemo, useState } from 'react'
import { breakLabel } from '../utils/format'
import {
  buildHeatmapData,
  formatHeatmapDateHeader,
  heatCellBackground,
} from '../utils/heatmap'

const BREAK_OPTIONS = ['spring', 'summer', 'autumn', 'winter']

export default function BreakHeatmap({ provinces }) {
  const [breakKey, setBreakKey] = useState('autumn')

  const { dates, rows, totals, maxCount, rangeStart, rangeEnd, hasVisibleProvinces } =
    useMemo(() => buildHeatmapData(breakKey, provinces), [breakKey, provinces])

  const dateHeaders = useMemo(
    () => dates.map((iso) => ({ iso, ...formatHeatmapDateHeader(iso) })),
    [dates],
  )

  return (
    <section className="heatmap-section" aria-label="假期热力图">
      <div className="heatmap-section__head">
        <h2 className="panel-title">假期热力图</h2>
        <PeriodPicker breakKey={breakKey} onChange={setBreakKey} />
      </div>
      {dates.length === 0 ? (
        <p className="heatmap-empty">
          当前假期类型（{breakLabel(breakKey)}）暂无有效日期数据。
        </p>
      ) : (
        <>
          <p className="panel-hint heatmap-range-hint">
            {breakLabel(breakKey)} · {rangeStart} 至 {rangeEnd} · 每日格子为
            该省城市在假人数
          </p>
          <div className="heatmap-scroll">
            <table className="heatmap-table">
              <thead>
                <tr className="heatmap-table__row-dates">
                  <th className="heatmap-table__corner" rowSpan={2} scope="col">
                    省份
                  </th>
                  {dateHeaders.map(({ iso, dateLabel }) => (
                    <th key={iso} className="heatmap-table__date" scope="col">
                      {dateLabel}
                    </th>
                  ))}
                </tr>
                <tr className="heatmap-table__row-weekdays">
                  {dateHeaders.map(({ iso, weekdayLabel }) => (
                    <th
                      key={`${iso}-wd`}
                      className="heatmap-table__weekday"
                      scope="col"
                    >
                      {weekdayLabel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.code}>
                    <th className="heatmap-table__province" scope="row">
                      {row.name}
                    </th>
                    {row.counts.map((count, i) => (
                      <td
                        key={`${row.code}-${dates[i]}`}
                        className="heatmap-table__cell"
                        style={{
                          backgroundColor:
                            heatCellBackground(count, maxCount) ?? undefined,
                        }}
                      >
                        {count > 0 ? count : ''}
                      </td>
                    ))}
                  </tr>
                ))}
                {hasVisibleProvinces ? (
                  <tr className="heatmap-table__total-row">
                    <th
                      className="heatmap-table__province heatmap-table__total-label"
                      scope="row"
                    >
                      全国合计
                    </th>
                    {totals.map((count, i) => (
                      <td
                        key={`total-${dates[i]}`}
                        className="heatmap-table__cell heatmap-table__cell--total"
                        style={{
                          backgroundColor:
                            heatCellBackground(count, maxCount) ?? undefined,
                        }}
                      >
                        {count > 0 ? count : ''}
                      </td>
                    ))}
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

function PeriodPicker({ breakKey, onChange }) {
  return (
    <div
      className="heatmap-period"
      role="radiogroup"
      aria-label="选择假期类型"
    >
      {BREAK_OPTIONS.map((key) => (
        <label key={key} className="heatmap-period__option">
          <input
            type="radio"
            name="break-period"
            value={key}
            checked={breakKey === key}
            onChange={() => onChange(key)}
          />
          <span>{breakLabel(key)}</span>
        </label>
      ))}
    </div>
  )
}
