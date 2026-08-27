'use client'

import { useMemo } from 'react'

import { FairwayProgress } from '@/components/trips/FairwayProgress'

interface PuttingCountdownProps {
  tripStart: string   // ISO date string e.g. "2026-03-05"
  tripLabel: string   // e.g. "Mar 5 – Mar 8, 2026 · Southern Pines, NC"
  bookingWindow?: number // days before trip the ball starts moving, default 90
}

export function PuttingCountdown({ tripStart, tripLabel, bookingWindow = 90 }: PuttingCountdownProps) {
  const { daysUntil, pct, headline } = useMemo(() => {
    const start = new Date(tripStart + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)

    const msPerDay = 86400000
    const daysUntil = Math.round((start.getTime() - today.getTime()) / msPerDay)

    let pct: number
    if (daysUntil <= 0) {
      pct = 1
    } else if (daysUntil >= bookingWindow) {
      pct = 0.04
    } else {
      pct = 1 - daysUntil / bookingWindow
      pct = Math.max(0.04, Math.min(0.96, pct))
    }


    let headline: string
    if (daysUntil === 0) {
      headline = "It's tee time."
    } else if (daysUntil < 0) {
      headline = 'Trip is underway.'
    } else {
      headline = `Tee it up in ${daysUntil} days`
    }


    return { daysUntil, pct, headline }
  }, [tripStart, bookingWindow])

  return (
    <div>
      {/* Header: eyebrow + big number + meta */}
      <div style={{ marginBottom: '16px' }}>
        {daysUntil > 0 ? (
          <>
            <div style={{
              fontFamily: 'var(--sans)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#6B6460',
              marginBottom: '4px',
            }}>
              Tee it up in
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{
                fontFamily: 'var(--serif)',
                fontSize: '56px',
                fontWeight: 400,
                color: '#2C2A26',
                lineHeight: 1,
              }}>
                {daysUntil}
              </span>
              <span style={{
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                color: '#6B6460',
              }}>
                days
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--sans)',
              fontSize: '11px',
              color: '#6B6460',
              marginTop: '6px',
            }}>
              {tripLabel}
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: '28px',
              fontWeight: 400,
              color: '#2C2A26',
              fontStyle: 'italic',
            }}>
              {headline}
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: '#6B6460', marginTop: '4px' }}>
              {tripLabel}
            </div>
          </>
        )}
      </div>
      <FairwayProgress progress={pct} daysUntil={daysUntil} />
    </div>
  )
}
