'use client'

import { useEffect, useState } from 'react'
import { SkeletonTable } from '@/components/ui/skeleton'

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

const TrophyIcon = () => (
  <svg className="h-4 w-4 text-[#B8956A]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
)

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

  const header = (
    <div className="flex items-center gap-2">
      <TrophyIcon />
      <h3 className="text-lg font-semibold text-[#252323]">Leaderboard</h3>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {header}
        <SkeletonTable rows={4} />
      </div>
    )
  }

  if (scores.length === 0) {
    return (
      <div className="space-y-4">
        {header}
        <div className="flex flex-col items-center justify-center rounded-[5px] border border-dashed border-[#DAD2BC] bg-white py-10 text-center">
          <p className="text-sm font-medium text-[#252323]">No scores recorded yet</p>
          <p className="mt-1 text-xs text-[#A99985]">Scores appear here after rounds are entered</p>
        </div>
      </div>
    )
  }

  const getRelativeToPar = (score: number, par: number) => {
    const diff = score - par
    if (diff === 0) return { text: 'E', color: 'text-[#A99985]' }
    if (diff > 0) return { text: `+${diff}`, color: 'text-[#8B4444]' }
    return { text: `${diff}`, color: 'text-[#4A7C59]' }
  }

  const sortedScores = [...scores].sort((a, b) => {
    const aDiff = a.score - (a.par || 72)
    const bDiff = b.score - (b.par || 72)
    return aDiff - bDiff
  })

  return (
    <div className="space-y-4">
      {header}
      <div className="space-y-2">
        {sortedScores.map((score, index) => {
          const par = score.par || 72
          const relative = getRelativeToPar(score.score, par)
          const isFirst = index === 0

          return (
            <div
              key={`${score.user_id}-${score.tee_time_id}`}
              className={`flex items-center justify-between rounded-[5px] border p-3 ${
                isFirst
                  ? 'border-[#B8956A]/30 bg-[#B8956A]/5'
                  : 'border-[#DAD2BC] bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isFirst ? 'bg-[#B8956A] text-white' : 'bg-[#F5F1ED] text-[#252323]'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className={`${isFirst ? 'font-semibold' : 'font-medium'} text-[#252323]`}>
                    {score.user_name}
                  </p>
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
    </div>
  )
}
