/** Parse a YYYY-MM-DD string as a local calendar date, not UTC midnight. */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Serialize a Date to YYYY-MM-DD using local time, no UTC conversion. */
export function toDateString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Format a wall-clock TIME value ("08:40" or "08:40:00") for display.
 * No Date object and no timezone involved — this is a string transform.
 */
export function formatTime(t: string | null | undefined): string {
  if (!t) return ''
  const [hStr, mStr] = t.split(':')
  const h = Number(hStr)
  if (!Number.isFinite(h)) return t
  const suffix = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${mStr ?? '00'} ${suffix}`
}

/** Format a YYYY-MM-DD calendar date for display, with no timezone shift. */
export function formatDate(
  s: string,
  opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
): string {
  if (!s) return ''
  return parseLocalDate(s).toLocaleDateString('en-US', opts)
}
