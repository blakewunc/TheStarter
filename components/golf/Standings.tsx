'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'

/**
 * Season standings. D.3 / D.5.
 *
 * "Build a scoreboard, not a feed." A feed you have to fill looks empty; a standings
 * table always looks alive — even with two members and three rounds, it reads as a
 * league that has started rather than a page waiting for content.
 */

interface Row {
  user_id: string
  name: string
  rounds_counted: number
  counting: number
  index: number | null
  best: number | null
  rank: number | null
}

export function Standings({ groupId }: { groupId: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [unrated, setUnrated] = useState(0)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/standings?year=${year}`)
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not load standings'))
      const data = await res.json()
      setRows(data.standings || [])
      setUnrated(data.unrated_rounds ?? 0)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [groupId, year])

  useEffect(() => {
    load()
  }, [load])

  const ranked = rows.filter((r) => r.index !== null)

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B6460]">
            {year} season
          </p>
          <h3 style={{ fontFamily: 'var(--serif)' }} className="text-2xl text-[#1C1A17]">
            Standings
          </h3>
        </div>
        <div className="flex gap-1">
          {[year - 1, year + 1].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className="min-h-11 rounded-[5px] border border-[#DAD2BC] px-3 text-xs text-[#1C1A17] transition-colors hover:bg-[#F5F1ED]"
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-[#6B6460]">Loading…</p>}
      {error && <div className="rounded-[5px] bg-[#FEF2F2] p-3 text-sm text-[#8B4444]">{error}</div>}

      {!loading && !error && ranked.length === 0 && (
        <p className="text-sm text-[#6B6460]">
          Nobody has three rated rounds yet. Post a round and add the course&rsquo;s tees
          and the table starts filling in.
        </p>
      )}

      {ranked.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr className="border-b border-[#DAD2BC] text-left">
                {['', 'Player', 'Index', 'Best', 'Rounds'].map((h) => (
                  <th
                    key={h}
                    className="pb-2 pr-3 text-[10px] font-medium uppercase tracking-[0.1em] text-[#6B6460]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className="border-b border-[#F5F1ED] last:border-0">
                  <td className="py-2.5 pr-3 text-[#6B6460]">{r.rank ?? '—'}</td>
                  <td className="py-2.5 pr-3 text-[#1C1A17]">{r.name}</td>
                  <td className="py-2.5 pr-3 font-medium text-[#1C1A17]">
                    {r.index ?? <span className="font-normal text-[#6B6460]">—</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-[#6B6460]">{r.best ?? '—'}</td>
                  <td className="py-2.5 pr-3 text-[#6B6460]">
                    {r.index === null && r.rounds_counted > 0
                      ? `${r.rounds_counted} of 3 needed`
                      : r.rounds_counted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-[#6B6460]">
        Lower is better. Index is the average of each player&rsquo;s best differentials
        this season — a house number, not an official Handicap Index.
        {unrated > 0 && (
          <>
            {' '}
            {unrated} {unrated === 1 ? 'round' : 'rounds'} played at courses with no
            rating on file, so {unrated === 1 ? 'it is' : 'they are'} not counted yet.
          </>
        )}
      </p>
    </div>
  )
}
