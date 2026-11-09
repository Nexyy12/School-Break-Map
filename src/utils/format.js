const BREAK_LABELS = {
  spring: '春假',
  summer: '暑假',
  autumn: '秋假',
  winter: '寒假',
}

export function breakLabel(key) {
  return BREAK_LABELS[key] ?? key
}

export function formatDateRange(start, end) {
  if (!start && !end) return '—'
  if (start && !end) return `${formatDate(start)} 起`
  if (!start && end) return `至 ${formatDate(end)}`
  if (start === end) return formatDate(start)
  return `${formatDate(start)} — ${formatDate(end)}`
}

function formatDate(iso) {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
