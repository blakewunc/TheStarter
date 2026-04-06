'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SkeletonList } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface GroupMakerProps {
  tripId: string
}

interface Player {
  user_id: string
  user_name: string
  handicap: number | null
}

type GroupMode = 'competitive' | 'balanced'

interface TeeTimeOption {
  id: string
  course_name: string
  tee_time: string
}

export function GroupMaker({ tripId }: GroupMakerProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [groups, setGroups] = useState<Player[][]>([])
  const [mode, setMode] = useState<GroupMode>('balanced')
  const [groupSize, setGroupSize] = useState(4)
  const [loading, setLoading] = useState(true)
  const [generated, setGenerated] = useState(false)
  const [teeTimes, setTeeTimes] = useState<TeeTimeOption[]>([])
  const [assigningTeeTimeId, setAssigningTeeTimeId] = useState<string>('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [equipRes, teeTimesRes] = await Promise.all([
          fetch(`/api/trips/${tripId}/golf/equipment`),
          fetch(`/api/trips/${tripId}/golf/tee-times`),
        ])
        if (equipRes.ok) {
          const data = await equipRes.json()
          const playerList: Player[] = (data.equipment || []).map((eq: any) => ({
            user_id: eq.user_id,
            user_name: eq.user_name,
            handicap: eq.handicap,
          }))
          setPlayers(playerList)
        }
        if (teeTimesRes.ok) {
          const data = await teeTimesRes.json()
          setTeeTimes(data.teeTimes || [])
          if (data.teeTimes?.length > 0) {
            setAssigningTeeTimeId(data.teeTimes[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tripId])

  const assignGroupsToTeeTime = async () => {
    if (!assigningTeeTimeId || groups.length === 0) return
    // Flatten all players in generated groups into a single player[] array
    const allPlayers = groups.flat().map((p) => p.user_id)
    setAssigning(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/golf/tee-times/${assigningTeeTimeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: allPlayers }),
      })
      if (!res.ok) throw new Error('Failed to assign')
      toast.success('Groups saved to tee time')
    } catch {
      toast.error('Could not save groups')
    } finally {
      setAssigning(false)
    }
  }

  const generateGroups = () => {
    if (players.length === 0) return

    // Separate players with and without handicaps
    const withHandicap = players.filter((p) => p.handicap !== null)
    const withoutHandicap = players.filter((p) => p.handicap === null)

    // Sort by handicap (lowest = best)
    const sorted = [...withHandicap].sort((a, b) => (a.handicap ?? 99) - (b.handicap ?? 99))

    // Add players without handicaps at the end
    const allSorted = [...sorted, ...withoutHandicap]

    const numGroups = Math.ceil(allSorted.length / groupSize)
    const newGroups: Player[][] = Array.from({ length: numGroups }, () => [])

    if (mode === 'competitive') {
      // Fill groups sequentially — best players together
      allSorted.forEach((player, i) => {
        const groupIndex = Math.floor(i / groupSize)
        if (groupIndex < numGroups) {
          newGroups[groupIndex].push(player)
        }
      })
    } else {
      // Snake draft — spread skill levels evenly
      // Round 1: Group 0, 1, 2, 3...
      // Round 2: Group 3, 2, 1, 0...
      // Round 3: Group 0, 1, 2, 3...
      let playerIndex = 0
      let round = 0

      while (playerIndex < allSorted.length) {
        const forward = round % 2 === 0

        if (forward) {
          for (let g = 0; g < numGroups && playerIndex < allSorted.length; g++) {
            if (newGroups[g].length < groupSize) {
              newGroups[g].push(allSorted[playerIndex])
              playerIndex++
            }
          }
        } else {
          for (let g = numGroups - 1; g >= 0 && playerIndex < allSorted.length; g--) {
            if (newGroups[g].length < groupSize) {
              newGroups[g].push(allSorted[playerIndex])
              playerIndex++
            }
          }
        }

        round++
      }
    }

    setGroups(newGroups)
    setGenerated(true)
  }

  const getGroupAvgHandicap = (group: Player[]) => {
    const withHcp = group.filter((p) => p.handicap !== null)
    if (withHcp.length === 0) return null
    const avg = withHcp.reduce((sum, p) => sum + (p.handicap ?? 0), 0) / withHcp.length
    return Math.round(avg * 10) / 10
  }

  if (loading) {
    return <SkeletonList count={3} />
  }

  if (players.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[#A99985]">No players have set up their golf profile yet</p>
        <p className="mt-1 text-xs text-[#A99985]">
          Players need to save their golf profile with a handicap first
        </p>
      </div>
    )
  }

  const playersWithHandicap = players.filter((p) => p.handicap !== null)
  const playersWithoutHandicap = players.filter((p) => p.handicap === null)

  return (
    <div className="space-y-5">
      {/* Player Overview */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-[#A99985]">
            <span className="font-semibold text-[#252323]">{players.length}</span> players
            {playersWithHandicap.length > 0 && (
              <> &middot; <span className="font-semibold text-[#252323]">{playersWithHandicap.length}</span> with handicaps</>
            )}
          </p>
        </div>

        {/* Player list sorted by handicap */}
        <div className="space-y-1.5">
          {[...playersWithHandicap]
            .sort((a, b) => (a.handicap ?? 99) - (b.handicap ?? 99))
            .map((p) => (
              <div key={p.user_id} className="flex items-center justify-between rounded-[5px] bg-[#F5F1ED] px-3 py-2">
                <span className="text-sm font-medium text-[#252323]">{p.user_name}</span>
                <span className="rounded-full bg-[#4A7C59]/10 px-2 py-0.5 text-xs font-semibold text-[#4A7C59]">
                  HCP {p.handicap}
                </span>
              </div>
            ))}
          {playersWithoutHandicap.map((p) => (
            <div key={p.user_id} className="flex items-center justify-between rounded-[5px] bg-[#F5F1ED] px-3 py-2">
              <span className="text-sm font-medium text-[#252323]">{p.user_name}</span>
              <span className="text-xs text-[#A99985]">No handicap</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 rounded-[5px] border border-[#DAD2BC] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[#A99985]">Group Mode</p>
            <div className="flex rounded-[5px] border border-[#DAD2BC] overflow-hidden">
              <button
                onClick={() => setMode('balanced')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  mode === 'balanced'
                    ? 'bg-[#70798C] text-white'
                    : 'bg-white text-[#252323] hover:bg-[#F5F1ED]'
                }`}
              >
                Balanced
              </button>
              <button
                onClick={() => setMode('competitive')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  mode === 'competitive'
                    ? 'bg-[#70798C] text-white'
                    : 'bg-white text-[#252323] hover:bg-[#F5F1ED]'
                }`}
              >
                Competitive
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[#A99985]">Per Group</p>
            <div className="flex rounded-[5px] border border-[#DAD2BC] overflow-hidden">
              {[2, 3, 4].map((size) => (
                <button
                  key={size}
                  onClick={() => setGroupSize(size)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    groupSize === size
                      ? 'bg-[#70798C] text-white'
                      : 'bg-white text-[#252323] hover:bg-[#F5F1ED]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#A99985]">
          {mode === 'balanced'
            ? 'Snake draft — spreads skill levels evenly across all groups'
            : 'Sequential — groups the best players together'}
        </p>

        <Button onClick={generateGroups} className="w-full">
          {generated ? 'Regenerate Groups' : 'Generate Groups'}
        </Button>
      </div>

      {/* Assign to tee time — shown after groups generated */}
      {generated && groups.length > 0 && teeTimes.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={assigningTeeTimeId}
            onChange={(e) => setAssigningTeeTimeId(e.target.value)}
            style={{
              flex: 1,
              fontSize: '12px',
              color: '#1C1A17',
              border: '0.5px solid rgba(28,26,23,0.20)',
              borderRadius: '5px',
              padding: '6px 10px',
              background: '#fff',
            }}
          >
            {teeTimes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.course_name}
              </option>
            ))}
          </select>
          <button
            onClick={assignGroupsToTeeTime}
            disabled={assigning}
            style={{
              background: '#70798C',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              opacity: assigning ? 0.6 : 1,
            }}
          >
            {assigning ? 'Saving...' : 'Save to Round'}
          </button>
        </div>
      )}

      {/* Generated Groups */}
      {generated && groups.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-[#252323]">
            {groups.length} Group{groups.length !== 1 ? 's' : ''}
          </h4>

          {groups.map((group, i) => {
            const avg = getGroupAvgHandicap(group)
            return (
              <div
                key={i}
                className="rounded-[5px] border border-[#DAD2BC] bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#252323]">Group {i + 1}</p>
                  {avg !== null && (
                    <span className="text-xs text-[#A99985]">Avg HCP: {avg}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {group.map((player) => (
                    <div
                      key={player.user_id}
                      className="flex items-center justify-between rounded-[4px] bg-[#F5F1ED] px-3 py-1.5"
                    >
                      <span className="text-sm text-[#252323]">{player.user_name}</span>
                      {player.handicap !== null ? (
                        <span className="text-xs font-medium text-[#4A7C59]">
                          {player.handicap}
                        </span>
                      ) : (
                        <span className="text-xs text-[#A99985]">--</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
