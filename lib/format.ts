export function formatPct(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return `${(value * 100).toFixed(digits)}%`
}

export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return "—"
  const diffMs = Date.now() - date.getTime()
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day}d ago`
  const mon = Math.round(day / 30)
  return `${mon}mo ago`
}

export function shortSha(sha: string | null | undefined): string {
  if (!sha) return "—"
  return sha.slice(0, 7)
}
