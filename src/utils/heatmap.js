function parseIso(iso) {
  return new Date(`${iso}T12:00:00`)
}

function addDays(iso, dayOffset) {
  const d = parseIso(iso)
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function enumerateDates(startIso, endIso) {
  const dates = []
  let cur = startIso
  while (cur <= endIso) {
    dates.push(cur)
    cur = addDays(cur, 1)
  }
  return dates
}

function isDayInRange(day, start, end) {
  return day >= start && day <= end
}

/**
 * @param {'spring'|'summer'|'autumn'|'winter'} breakKey
 * @param {Array<{ code: string, name: string, cities: Array<{ breaks: Record<string, { start: string|null, end: string|null }> }> }>} provinces
 */
export function buildHeatmapData(breakKey, provinces) {
  let rangeStart = null
  let rangeEnd = null

  for (const province of provinces) {
    for (const city of province.cities) {
      const br = city.breaks?.[breakKey]
      if (br?.start && br?.end) {
        if (!rangeStart || br.start < rangeStart) rangeStart = br.start
        if (!rangeEnd || br.end > rangeEnd) rangeEnd = br.end
      }
    }
  }

  const dates =
    rangeStart && rangeEnd ? enumerateDates(rangeStart, rangeEnd) : []

  const rows = provinces.map((province) => {
    const counts = dates.map((day) => {
      let n = 0
      for (const city of province.cities) {
        const br = city.breaks?.[breakKey]
        if (br?.start && br?.end && isDayInRange(day, br.start, br.end)) {
          n += 1
        }
      }
      return n
    })
    return { code: province.code, name: province.name, counts }
  })

  const totals = dates.map((_, col) =>
    rows.reduce((sum, row) => sum + row.counts[col], 0),
  )

  const visibleRows = rows.filter((row) => row.counts.some((c) => c > 0))

  let maxCount = 0
  for (const row of visibleRows) {
    for (const c of row.counts) {
      if (c > maxCount) maxCount = c
    }
  }
  for (const t of totals) {
    if (t > maxCount) maxCount = t
  }

  return {
    breakKey,
    dates,
    rows: visibleRows,
    totals,
    maxCount,
    rangeStart,
    rangeEnd,
    hasVisibleProvinces: visibleRows.length > 0,
  }
}

export function heatCellBackground(count, maxCount) {
  if (!count || !maxCount) return null
  const ratio = count / maxCount
  const lightness = 97 - ratio * 52
  const saturation = 28 + ratio * 62
  return `hsl(214, ${saturation}%, ${lightness}%)`
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatHeatmapDateHeader(iso) {
  const d = parseIso(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return {
    dateLabel: `${month}/${day}`,
    weekdayLabel: WEEKDAY_SHORT[d.getDay()],
  }
}
