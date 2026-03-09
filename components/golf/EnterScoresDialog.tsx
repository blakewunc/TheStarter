'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface TeeTime {
  id: string
  course_name: string
  par: number
}

interface Member {
  user_id: string
  display_name: string
}

interface EnterScoresDialogProps {
  tripId: string
  teeTime: TeeTime | null
  members: Member[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnterScoresDialog({ tripId, teeTime, members, open, onOpenChange }: EnterScoresDialogProps) {
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState<Record<string, string>>({})
  const [existingScores, setExistingScores] = useState<Record<string, number>>({})

  // Fetch existing scores for this tee time when dialog opens
  useEffect(() => {
    if (!open || !teeTime) return

    async function fetchExisting() {
      try {
        const response = await fetch(`/api/trips/${tripId}/golf/scores`)
        if (response.ok) {
          const data = await response.json()
          const existing: Record<string, number> = {}
          const initial: Record<string, string> = {}
          for (const s of data.scores || []) {
            if (s.tee_time_id === teeTime!.id) {
              existing[s.user_id] = s.score
              initial[s.user_id] = String(s.score)
            }
          }
          setExistingScores(existing)
          setScores(initial)
        }
      } catch {
        // Silently fail
      }
    }

    fetchExisting()
  }, [open, teeTime, tripId])

  if (!teeTime) return null

  const par = teeTime.par || 72

  const getRelativeToPar = (score: number) => {
    const diff = score - par
    if (diff === 0) return { text: 'E', color: 'text-[#A99985]' }
    if (diff > 0) return { text: `+${diff}`, color: 'text-[#8B4444]' }
    return { text: `${diff}`, color: 'text-[#4A7C59]' }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const scoreEntries = Object.entries(scores)
        .filter(([, val]) => val && parseInt(val) > 0)
        .map(([userId, val]) => ({
          user_id: userId,
          score: parseInt(val),
        }))

      if (scoreEntries.length === 0) {
        toast.error('Enter at least one score')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/trips/${tripId}/golf/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tee_time_id: teeTime.id,
          scores: scoreEntries,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save scores')
      }

      toast.success('Scores saved!')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Enter Scores</DialogTitle>
          <DialogDescription>
            {teeTime.course_name} &middot; Par {par}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {members.map((member) => {
            const val = scores[member.user_id] || ''
            const numVal = parseInt(val)
            const relative = !isNaN(numVal) && numVal > 0 ? getRelativeToPar(numVal) : null

            return (
              <div key={member.user_id} className="flex items-center gap-3">
                <Label className="min-w-0 flex-1 truncate text-sm font-medium text-[#252323]">
                  {member.display_name}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="40"
                    max="200"
                    placeholder="--"
                    value={val}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [member.user_id]: e.target.value }))
                    }
                    className="w-20 text-center"
                    disabled={loading}
                  />
                  <span className={`w-10 text-right text-sm font-semibold ${relative?.color || 'text-transparent'}`}>
                    {relative?.text || '--'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? 'Saving...' : existingScores && Object.keys(existingScores).length > 0 ? 'Update Scores' : 'Save Scores'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
