'use client'

import { useEffect, useRef, useState } from 'react'

export interface Course {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  lat: number | null
  lng: number | null
  timezone: string | null
  access: string | null
  par: number | null
}

interface CoursePickerProps {
  /** Current course name text. Always the source of truth for what gets submitted. */
  value: string
  onChange: (name: string) => void
  /** Fires with the full record when a dropdown result is chosen, null when free text. */
  onSelectCourse: (course: Course | null) => void
  /** Optional "lat,lng" of the trip destination, used to bias results by distance. */
  near?: string | null
  required?: boolean
  disabled?: boolean
  placeholder?: string
  id?: string
  name?: string
}

const DEBOUNCE_MS = 250
const MIN_CHARS = 2

const ACCESS_LABELS: Record<string, string> = {
  public: 'Public',
  resort: 'Resort',
  private: 'Private',
  municipal: 'Municipal',
  semi_private: 'Semi-private',
}

function AccessBadge({ access }: { access: string | null }) {
  if (!access) return null
  const label = ACCESS_LABELS[access] || access
  return (
    <span className="shrink-0 rounded-full bg-[#F5F1ED] px-2 py-0.5 text-[10px] font-medium text-[#70798C]">
      {label}
    </span>
  )
}

export function CoursePicker({
  value,
  onChange,
  onSelectCourse,
  near,
  required,
  disabled,
  placeholder = 'e.g., Pebble Beach Golf Links',
  id,
  name,
}: CoursePickerProps) {
  const [results, setResults] = useState<Course[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  // Set while we apply a selection, so the resulting value change doesn't re-open
  // the dropdown and re-search for the name we just committed.
  const skipNextSearch = useRef(false)

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return
    }

    const q = value.trim()
    if (q.length < MIN_CHARS) {
      setResults([])
      setOpen(false)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ q })
        if (near) params.set('near', near)
        const res = await fetch(`/api/courses/search?${params}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('search failed')
        const json = await res.json()
        if (cancelled) return
        setResults(json.courses || [])
        setHighlighted(-1)
        setOpen((json.courses || []).length > 0)
      } catch {
        // A failed lookup must never block the form — the typed text still submits.
        if (!cancelled) {
          setResults([])
          setOpen(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [value, near])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const select = (course: Course) => {
    skipNextSearch.current = true
    onChange(course.name)
    onSelectCourse(course)
    setOpen(false)
    setResults([])
    setHighlighted(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      // Enter with no dropdown open must fall through to normal form submission.
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      // Only intercept Enter when a result is actively highlighted. Otherwise Enter
      // commits whatever was typed, which is the whole point of the free-text path.
      if (highlighted >= 0) {
        e.preventDefault()
        select(results[highlighted])
      } else {
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          // Any keystroke after a selection means the text no longer matches that
          // record, so drop the association and fall back to free text.
          onSelectCourse(null)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#252323] placeholder-[#A99985] outline-none focus:border-[#70798C]"
      />

      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#A99985]">
          searching…
        </span>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-[5px] border border-[#DAD2BC] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          {results.map((course, i) => (
            <li key={course.id}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => select(course)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                  i === highlighted ? 'bg-[#F5F1ED]' : 'bg-white'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-[#252323]">{course.name}</span>
                  {(course.city || course.state) && (
                    <span className="block truncate text-xs text-[#A99985]">
                      {[course.city, course.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </span>
                <AccessBadge access={course.access} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
