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
 * Heatmap counts only: if an official break sits immediately before or after
 * a Sat–Sun weekend, extend the effective range to include that full weekend
 * (e.g. Fri end → through Sun; Mon start → from preceding Sat).
 */
export function expandBreakWithWeekends(start, end) {
  if (!start || !end) return { start, end }

  let effStart = start
  let effEnd = end

  const startDow = parseIso(start).getDay()
  if (startDow === 1) {
    effStart = addDays(start, -2)
  }

  const endDow = parseIso(end).getDay()
  if (endDow === 5) {
    effEnd = addDays(end, 2)
  } else if (endDow === 6) {
    effEnd = addDays(end, 1)
  }

  return { start: effStart, end: effEnd }
}

function effectiveBreakRange(br) {
  if (!br?.start || !br?.end) return null
  return expandBreakWithWeekends(br.start, br.end)
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
      const eff = effectiveBreakRange(br)
      if (eff) {
        if (!rangeStart || eff.start < rangeStart) rangeStart = eff.start
        if (!rangeEnd || eff.end > rangeEnd) rangeEnd = eff.end
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
        const eff = effectiveBreakRange(br)
        if (eff && isDayInRange(day, eff.start, eff.end)) {
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

  let maxCount = 0
  for (const row of rows) {
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
    rows,
    totals,
    maxCount,
    rangeStart,
    rangeEnd,
  }
}

/**
 * Province codes with at least one city on break for `day` (heatmap effective ranges).
 */
export function provincesOnBreakForDay(breakKey, provinces, day) {
  if (!day) return []
  const codes = []
  for (const province of provinces) {
    let any = false
    for (const city of province.cities) {
      const br = city.breaks?.[breakKey]
      const eff = effectiveBreakRange(br)
      if (eff && isDayInRange(day, eff.start, eff.end)) {
        any = true
        break
      }
    }
    if (any) codes.push(province.code)
  }
  return codes
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
