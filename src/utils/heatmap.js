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

function effectiveRangeDays(start, end) {
  const eff = expandBreakWithWeekends(start, end)
  if (!eff?.start || !eff?.end) return []
  return enumerateDates(eff.start, eff.end)
}

/**
 * Union of heatmap-effective days for a city/season: primary start–end plus
 * every entry in optional `ranges[]` (deduped per day).
 *
 * @param {{ breaks?: Record<string, { start?: string|null, end?: string|null, ranges?: Array<{ start: string, end: string }> }> }} city
 * @param {'spring'|'summer'|'autumn'|'winter'} breakKey
 * @returns {string[]}
 */
export function getCityBreakDays(city, breakKey) {
  const br = city.breaks?.[breakKey]
  if (!br) return []

  const daySet = new Set()

  const addSpan = (start, end) => {
    for (const d of effectiveRangeDays(start, end)) {
      daySet.add(d)
    }
  }

  if (br.ranges?.length) {
    for (const r of br.ranges) {
      addSpan(r.start, r.end)
    }
  }

  if (br.start && br.end) {
    addSpan(br.start, br.end)
  }

  return [...daySet].sort()
}

function cityOnBreakForDay(city, breakKey, day) {
  return getCityBreakDays(city, breakKey).includes(day)
}

/**
 * @param {'spring'|'summer'|'autumn'|'winter'} breakKey
 * @param {Array<{ code: string, name: string, cities: Array<{ breaks: Record<string, { start: string|null, end: string|null, ranges?: Array<{ start: string, end: string }> }> }> }>} provinces
 */
export function buildHeatmapData(breakKey, provinces) {
  let rangeStart = null
  let rangeEnd = null

  for (const province of provinces) {
    for (const city of province.cities) {
      const days = getCityBreakDays(city, breakKey)
      if (!days.length) continue
      const first = days[0]
      const last = days[days.length - 1]
      if (!rangeStart || first < rangeStart) rangeStart = first
      if (!rangeEnd || last > rangeEnd) rangeEnd = last
    }
  }

  const dates =
    rangeStart && rangeEnd ? enumerateDates(rangeStart, rangeEnd) : []

  const rows = provinces.map((province) => {
    const counts = dates.map((day) => {
      let n = 0
      for (const city of province.cities) {
        if (cityOnBreakForDay(city, breakKey, day)) {
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

/**
 * Cities (with province metadata) on break for `day`; optional `provinceCode` filter.
 */
export function citiesOnBreakForDay(breakKey, provinces, day, provinceCode = null) {
  if (!day) return []
  const list = []
  for (const province of provinces) {
    if (provinceCode && province.code !== provinceCode) continue
    for (const city of province.cities) {
      if (cityOnBreakForDay(city, breakKey, day)) {
        list.push({
          provinceCode: province.code,
          provinceName: province.name,
          city,
        })
      }
    }
  }
  list.sort((a, b) => {
    const byProvince = a.provinceName.localeCompare(b.provinceName, 'zh')
    if (byProvince !== 0) return byProvince
    return a.city.name.localeCompare(b.city.name, 'zh')
  })
  return list
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
      if (cityOnBreakForDay(city, breakKey, day)) {
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
