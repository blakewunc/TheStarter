'use client'

import { useCallback, useEffect, useState } from 'react'
import { LogRoundDialog } from '@/components/golf/LogRoundDialog'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'
import { formatDate } from '@/lib/dates'

/**
 * My rounds. D.1 — a round is weekly, a trip is annual, so this is the surface that
 * gives someone a reason to open the app between trips.
 */

interface Round {
  id: string
  course_name: string
  played_on: string
  gross_score: number | null
  verified: boolean
  differential: number | null
  tee: { tee_set: string; course_rating: number; slope: number; par: number } | null
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [index, setIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/rounds')
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not load your rounds'))
      const data = await res.json()
      setRounds(data.rounds || [])
      setIndex(data.starter_index ?? null)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rated = rounds.filter((r) => r.differential !== null).length

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl page-title tracking-tight text-[#1C1A17]">My rounds</h1>
            <p className="mt-1 text-[#6B6460]">
              Every round counts. Rated courses also count toward your index.
            </p>
          </div>
          <LogRoundDialog onLogged={load} />
        </div>

        {index !== null && (
          <div className="mb-6 rounded-[5px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B6460]">
              Starter Index
            </p>
            <p style={{ fontFamily: 'var(--serif)' }} className="text-4xl text-[#1C1A17]">
              {index}
            </p>
            <p className="mt-1 text-xs text-[#6B6460]">
              A house number from your {rated} rated {rated === 1 ? 'round' : 'rounds'}, not
              an official Handicap Index.
            </p>
          </div>
        )}

        {loading && <p className="text-[#6B6460]">Loading…</p>}
        {error && <div className="rounded-[5px] bg-[#FEF2F2] p-4 text-sm text-[#8B4444]">{error}</div>}

        {!loading && !error && rounds.length === 0 && (
          <div className="rounded-[5px] border-2 border-dashed border-[#DAD2BC] p-12 text-center">
            <h2 className="text-base font-semibold text-[#1C1A17]">No rounds yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B6460]">
              Log one from the drive home — course, date, score. It takes about fifteen
              seconds.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {rounds.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[5px] border border-[#DAD2BC] bg-white p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-[#1C1A17]">{r.course_name}</p>
                <p className="text-sm text-[#6B6460]">
                  {formatDate(r.played_on, { weekday: 'short', month: 'short', day: 'numeric' })}
                  {r.tee ? ` · ${r.tee.tee_set}` : ''}
                  {r.verified ? ' · verified' : ''}
                </p>
              </div>
              <div className="shrink-0 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                <p className="text-xl font-medium text-[#1C1A17]">{r.gross_score}</p>
                <p className="text-xs text-[#6B6460]">
                  {r.differential !== null ? `${r.differential} diff` : 'unrated course'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
