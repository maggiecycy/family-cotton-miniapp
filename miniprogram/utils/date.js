function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

function formatDate(input, withTime = true) {
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  if (!withTime) return `${y}-${m}-${day}`
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${y}-${m}-${day} ${hh}:${mm}`
}

function todayKey(date = new Date()) {
  return formatDate(date, false)
}

function daysBetween(from, to = Date.now()) {
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.max(1, Math.floor((b - a) / (1000 * 60 * 60 * 24)) + 1)
}

function relativeDayLabel(input) {
  const d = new Date(input)
  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startToday - startThat) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`
  return formatDate(d, false)
}

module.exports = {
  formatDate,
  todayKey,
  daysBetween,
  relativeDayLabel
}
