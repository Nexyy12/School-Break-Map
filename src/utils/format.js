const BREAK_LABELS = {
  spring: '春假',
  summer: '暑假',
  autumn: '秋假',
  winter: '寒假',
}

export function breakLabel(key, seasonLabel) {
  if (seasonLabel) return seasonLabel(key)
  return BREAK_LABELS[key] ?? key
}

export function formatDateRange(start, end, locale = 'zh', t) {
  if (!start && !end) return '—'
  const format = (iso) => formatDate(iso, locale)
  if (start && !end) {
    return t
      ? t('format.from', { date: format(start) })
      : `${format(start)} 起`
  }
  if (!start && end) {
    return t ? t('format.until', { date: format(end) }) : `至 ${format(end)}`
  }
  if (start === end) return format(start)
  const sep = locale === 'en' ? ' — ' : ' — '
  return `${format(start)}${sep}${format(end)}`
}

function formatDate(iso, locale = 'zh') {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const tag = locale === 'en' ? 'en-US' : 'zh-CN'
  return d.toLocaleDateString(tag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
