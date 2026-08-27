'use client'

import { useEffect, useRef, useState } from 'react'

export interface Destination {
  label: string
  city: string
  state: string
  courseCount: number
  lat: number | null
  lng: number | null
}

interface DestinationPickerProps {
  value: string
  onChange: (value: string) => void
  /** Fires with the resolved place when one is picked, null when the text is free-form. */
  onSelect?: (destination: Destination | null) => void
  required?: boolean
  disabled?: boolean
  id?: string
  placeholder?: string
}

const DEBOUNCE_MS = 250
const MIN_CHARS = 2

export function DestinationPicker({
  value,
  onChange,
  onSelect,
  required,
  disabled,
  id,
  placeholder = 'e.g., Pinehurst, NC',
}: DestinationPickerProps) {
  const [results, setResults] = useState<Destination[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
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
      try {
        const res = await fetch(`/api/destinations/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('lookup failed')
        const json = await res.json()
        if (cancelled) return
        setResults(json.destinations || [])
        setHighlighted(-1)
        setOpen((json.destinations || []).length > 0)
      } catch {
        // A failed lookup must never block the form — the typed destination still saves.
        if (!cancelled) {
          setResults([])
          setOpen(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [value])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const select = (d: Destination) => {
    skipNextSearch.current = true
    onChange(d.label)
    onSelect?.(d)
    setOpen(false)
    setResults([])
    setHighlighted(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      // Enter only takes a suggestion when one is actively highlighted; otherwise it
      // submits whatever was typed, so a town with no seeded course still works.
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
        type="text"
        autoComplete="off"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          onSelect?.(null)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#1C1A17] transition-all placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17] focus:ring-opacity-15 disabled:cursor-not-allowed disabled:bg-[#F5F1ED] disabled:opacity-40"
      />

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-[5px] border border-[#DAD2BC] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          {results.map((d, i) => (
            <li key={d.label}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => select(d)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                  i === highlighted ? 'bg-[#F5F1ED]' : 'bg-white'
                }`}
              >
                <span className="text-sm text-[#1C1A17]">{d.label}</span>
                <span className="shrink-0 text-xs text-[#6B6460]">
                  {d.courseCount} {d.courseCount === 1 ? 'course' : 'courses'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
