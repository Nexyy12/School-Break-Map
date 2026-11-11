import { useMemo } from 'react'
import {
  buildHeatmapData,
  formatHeatmapDateHeader,
  heatCellBackground,
} from '../utils/heatmap'
import { useI18n } from '../i18n/I18nContext'

const BREAK_OPTIONS = ['spring', 'summer', 'autumn', 'winter']

export default function BreakHeatmap({
  provinces,
  breakKey,
  onBreakKeyChange,
  selectedDate,
  onSelectDate,
}) {
  const { t, locale, seasonLabel } = useI18n()
  const {
    dates,
    rows,
    totals,
    maxCount,
    rangeStart,
    rangeEnd,
    hasVisibleProvinces,
  } = useMemo(
    () => buildHeatmapData(breakKey, provinces),
    [breakKey, provinces],
  )

  const dateHeaders = useMemo(
    () => dates.map((iso) => ({ iso, ...formatHeatmapDateHeader(iso, locale) })),
    [dates, locale],
  )

  const toggleDate = (iso) => {
    onSelectDate(selectedDate === iso ? null : iso)
  }

  const columnClass = (iso) =>
    selectedDate === iso ? 'heatmap-table__col--selected' : ''

  const season = seasonLabel(breakKey)

  return (
    <section className="heatmap-section" aria-label={t('heatmap.ariaLabel')}>
      <div className="heatmap-section__head">
        <h2 className="panel-title">{t('heatmap.title')}</h2>
        <PeriodPicker breakKey={breakKey} onChange={onBreakKeyChange} />
      </div>
      {dates.length === 0 ? (
        <p className="heatmap-empty">{t('heatmap.empty', { season })}</p>
      ) : (
        <>
          <p className="panel-hint heatmap-range-hint">
            {t('heatmap.rangeHintBase', {
              season,
              start: rangeStart,
              end: rangeEnd,
            })}
            {selectedDate ? (
              <> {t('heatmap.selectedHint', { date: selectedDate })}</>
            ) : (
              <> {t('heatmap.clickHint')}</>
            )}
          </p>
          <div className="heatmap-scroll">
            <table className="heatmap-table">
              <thead>
                <tr className="heatmap-table__row-dates">
                  <th className="heatmap-table__corner" rowSpan={2} scope="col">
                    {t('heatmap.provinceColumn')}
                  </th>
                  {dateHeaders.map(({ iso, dateLabel }) => (
                    <th
                      key={iso}
                      className={[
                        'heatmap-table__date',
                        'heatmap-table__date--selectable',
                        columnClass(iso),
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      scope="col"
                    >
                      <button
                        type="button"
                        className="heatmap-date-btn"
                        aria-pressed={selectedDate === iso}
                        onClick={() => toggleDate(iso)}
                      >
                        {dateLabel}
                      </button>
                    </th>
                  ))}
                </tr>
                <tr className="heatmap-table__row-weekdays">
                  {dateHeaders.map(({ iso, weekdayLabel }) => (
                    <th
                      key={`${iso}-wd`}
                      className={[
                        'heatmap-table__weekday',
                        'heatmap-table__weekday--selectable',
                        columnClass(iso),
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      scope="col"
                    >
                      <button
                        type="button"
                        className="heatmap-date-btn heatmap-date-btn--weekday"
                        aria-pressed={selectedDate === iso}
                        onClick={() => toggleDate(iso)}
                      >
                        {weekdayLabel}
                      </button>
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
                        className={[
                          'heatmap-table__cell',
                          count > 0 ? 'heatmap-table__cell--clickable' : '',
                          columnClass(dates[i]),
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{
                          backgroundColor:
                            heatCellBackground(count, maxCount) ?? undefined,
                        }}
                        onClick={
                          count > 0 ? () => toggleDate(dates[i]) : undefined
                        }
                        onKeyDown={
                          count > 0
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  toggleDate(dates[i])
                                }
                              }
                            : undefined
                        }
                        tabIndex={count > 0 ? 0 : undefined}
                        role={count > 0 ? 'button' : undefined}
                        aria-pressed={
                          count > 0 ? selectedDate === dates[i] : undefined
                        }
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
                      {t('heatmap.nationalTotal')}
                    </th>
                    {totals.map((count, i) => (
                      <td
                        key={`total-${dates[i]}`}
                        className={[
                          'heatmap-table__cell',
                          'heatmap-table__cell--total',
                          count > 0 ? 'heatmap-table__cell--clickable' : '',
                          columnClass(dates[i]),
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{
                          backgroundColor:
                            heatCellBackground(count, maxCount) ?? undefined,
                        }}
                        onClick={
                          count > 0 ? () => toggleDate(dates[i]) : undefined
                        }
                        role={count > 0 ? 'button' : undefined}
                        tabIndex={count > 0 ? 0 : undefined}
                        aria-pressed={
                          count > 0 ? selectedDate === dates[i] : undefined
                        }
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
  const { t, seasonLabel } = useI18n()

  return (
    <div className="heatmap-period" role="radiogroup" aria-label={t('heatmap.periodAriaLabel')}>
      {BREAK_OPTIONS.map((key) => (
        <label key={key} className="heatmap-period__option">
          <input
            type="radio"
            name="break-period"
            value={key}
            checked={breakKey === key}
            onChange={() => onChange(key)}
          />
          <span>{seasonLabel(key)}</span>
        </label>
      ))}
    </div>
  )
}
