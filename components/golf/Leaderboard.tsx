'use client'

import { useEffect, useState } from 'react'

interface LeaderboardProps {
  tripId: string
}

interface Score {
  user_id: string
  user_name: string
  score: number
  handicap: number | null
  tee_time_id: string
  course_name: string
  par: number
}

export function Leaderboard({ tripId }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScores() {
      try {
        const response = await fetch(`/api/trips/${tripId}/golf/scores`)
        if (response.ok) {
          const data = await response.json()
          setScores(data.scores || [])
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [tripId])

  if (loading) {
    return <p className="text-sm text-[#A99985]">Loading scores...</p>
  }

  if (scores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#A99985]">No scores recorded yet</p>
        <p className="text-xs text-[#A99985] mt-2">
          Scores will appear here after rounds are completed
        </p>
      </div>
    )
  }

  const getRelativeToPar = (score: number, par: number) => {
    const diff = score - par
    if (diff === 0) return { text: 'E', color: 'text-[#A99985]' }
    if (diff > 0) return { text: `+${diff}`, color: 'text-[#8B4444]' }
    return { text: `${diff}`, color: 'text-[#4A7C59]' }
  }

  // Sort by score relative to par (best first)
  const sortedScores = [...scores].sort((a, b) => {
    const aDiff = a.score - (a.par || 72)
    const bDiff = b.score - (b.par || 72)
    return aDiff - bDiff
  })

  return (
    <div className="space-y-3">
      {sortedScores.map((score, index) => {
        const par = score.par || 72
        const relative = getRelativeToPar(score.score, par)

        return (
          <div
            key={`${score.user_id}-${score.tee_time_id}`}
            className="flex items-center justify-between rounded-[5px] border border-[#DAD2BC] bg-white p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F1ED] text-sm font-semibold text-[#252323]">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-[#252323]">{score.user_name}</p>
                <p className="text-xs text-[#A99985]">{score.course_name} &middot; Par {par}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-[#252323]">{score.score}</span>
                <span className={`text-sm font-semibold ${relative.color}`}>
                  {relative.text}
                </span>
              </div>
              {score.handicap !== null && (
                <p className="text-xs text-[#A99985]">HCP: {score.handicap}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
