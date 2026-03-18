'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BetEntry {
  id: string
  trip_id: string
  tee_time_id: string | null
  bet_type: string
  amount: number
  description: string
  participants: string[]
  status: 'open' | 'settled'
  winner_id: string | null
  expense_id: string | null
  created_by: string
  created_at: string
  winner?: { id: string; display_name: string | null; email: string }
  tee_time?: { id: string; course_name: string; tee_time: string }
}

interface Member {
  user_id: string
  display_name: string
  email: string
}

interface TeeTimeOption {
  id: string
  course_name: string
  tee_time: string
}

interface Score {
  user_id: string
  user_name: string
  score: number
  handicap: number | null
  tee_time_id: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BET_TYPES: Record<string, { label: string; emoji: string; desc: string; autoCalc: boolean }> = {
  low_gross: {
    label: 'Low Gross',
    emoji: '🏆',
    desc: 'Lowest raw score wins the pot. Auto-calculated from scores.',
    autoCalc: true,
  },
  low_net: {
    label: 'Low Net',
    emoji: '🎯',
    desc: 'Score minus handicap — lowest net wins. Levels the playing field.',
    autoCalc: true,
  },
  closest_to_pin: {
    label: 'Closest to Pin',
    emoji: '📍',
    desc: 'Shortest approach to the pin on a designated par 3. Manual winner.',
    autoCalc: false,
  },
  longest_drive: {
    label: 'Longest Drive',
    emoji: '💨',
    desc: 'Longest drive in the fairway on a designated hole. Manual winner.',
    autoCalc: false,
  },
  nassau: {
    label: 'Nassau',
    emoji: '🃏',
    desc: 'Classic 3-bet: front 9, back 9, and full 18. Create one per segment. Manual winner.',
    autoCalc: false,
  },
  skins: {
    label: 'Skins',
    emoji: '🎰',
    desc: 'Win holes outright — ties carry the pot to the next hole. Manual winner.',
    autoCalc: false,
  },
  custom: {
    label: 'Custom',
    emoji: '⚙️',
    desc: 'Name your own bet and pick the winner manually.',
    autoCalc: false,
  },
}

const AUTO_DESCRIPTIONS: Record<string, string> = {
  low_gross: 'Low Gross',
  low_net: 'Low Net',
  closest_to_pin: 'Closest to Pin',
  longest_drive: 'Longest Drive',
  nassau: 'Nassau',
  skins: 'Skins',
  custom: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTeeTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoString
  }
}

// ─── Auto-winner logic ────────────────────────────────────────────────────────

function getAutoWinner(bet: BetEntry, scores: Score[]): string | null {
  if (bet.bet_type !== 'low_gross' && bet.bet_type !== 'low_net') return null
  if (!bet.tee_time_id) return null

  const relevant = scores.filter(
    (s) => s.tee_time_id === bet.tee_time_id && bet.participants.includes(s.user_id)
  )
  if (relevant.length < 2) return null

  if (bet.bet_type === 'low_gross') {
    const sorted = [...relevant].sort((a, b) => a.score - b.score)
    return sorted[0].user_id
  } else {
    const sorted = [...relevant].sort(
      (a, b) => (a.score - (a.handicap || 0)) - (b.score - (b.handicap || 0))
    )
    return sorted[0].user_id
  }
}

// ─── BetCard ──────────────────────────────────────────────────────────────────

interface BetCardProps {
  bet: BetEntry
  members: Member[]
  deletingId: string | null
  onSettle: (bet: BetEntry) => void
  onDeleteRequest: (id: string) => void
  onDeleteConfirm: (id: string) => void
  onDeleteCancel: () => void
}

function BetCard({
  bet,
  members,
  deletingId,
  onSettle,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: BetCardProps) {
  const meta = BET_TYPES[bet.bet_type] ?? { label: bet.bet_type, emoji: '🎲', desc: '' }
  const losers = bet.participants.filter((p) => p !== bet.winner_id)
  const pot = bet.amount * losers.length

  const getWinnerName = () => {
    if (bet.winner?.display_name) return bet.winner.display_name
    if (bet.winner?.email) return bet.winner.email
    const m = members.find((m) => m.user_id === bet.winner_id)
    return m?.display_name || m?.email || 'Unknown'
  }

  if (bet.status === 'settled') {
    return (
      <div className="rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED]/50 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{meta.emoji}</span>
            <span className="font-semibold text-[#252323]">{meta.label}</span>
          </div>
          <span className="rounded-full bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs text-[#4A7C59]">
            ${bet.amount}/person
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[#A99985]">{bet.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#B8956A]/10 px-2.5 py-0.5 text-xs text-[#B8956A]">
            🏆 {getWinnerName()} won
          </span>
          <span className="text-xs text-[#A99985]">
            +${pot.toFixed(2)} added to expenses
          </span>
        </div>
      </div>
    )
  }

  // Open bet
  const pot2 = bet.amount * (bet.participants.length - 1)
  return (
    <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-semibold text-[#252323]">{meta.label}</span>
        </div>
        <span className="rounded-full bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs text-[#4A7C59]">
          ${bet.amount}/person
        </span>
      </div>

      <p className="mt-1.5 text-sm text-[#A99985]">{bet.description}</p>

      {bet.tee_time && (
        <p className="mt-1 text-xs text-[#A99985]">
          📅 {bet.tee_time.course_name} · {formatTeeTime(bet.tee_time.tee_time)}
        </p>
      )}

      <p className="mt-1 text-xs text-[#A99985]">
        👤 {bet.participants.length} players · ${bet.amount}/person · ${pot2.toFixed(2)} pot
      </p>

      {deletingId === bet.id ? (
        <div className="mt-3 flex items-center gap-2 rounded-[5px] border border-[#8B4444]/20 bg-[#8B4444]/5 p-2">
          <span className="flex-1 text-sm text-[#8B4444]">Are you sure?</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeleteConfirm(bet.id)}
            className="h-7 px-3 text-xs"
          >
            Confirm Delete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDeleteCancel}
            className="h-7 px-3 text-xs"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSettle(bet)}
            className="border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59]/5"
          >
            Settle Up
          </Button>
          <button
            onClick={() => onDeleteRequest(bet.id)}
            className="ml-auto p-1.5 text-[#A99985] transition-colors hover:text-[#8B4444]"
            aria-label="Delete bet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── AddBetDialog ─────────────────────────────────────────────────────────────

interface AddBetDialogProps {
  open: boolean
  onClose: () => void
  tripId: string
  members: Member[]
  teeTimes: TeeTimeOption[]
  onAdded: (bet: BetEntry) => void
}

function AddBetDialog({ open, onClose, tripId, members, teeTimes, onAdded }: AddBetDialogProps) {
  const [selectedType, setSelectedType] = useState<string>('low_gross')
  const [description, setDescription] = useState('Low Gross')
  const [amount, setAmount] = useState('')
  const [teeTimeId, setTeeTimeId] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Initialize participants with all members
  useEffect(() => {
    if (open) {
      setSelectedParticipants(members.map((m) => m.user_id))
    }
  }, [open, members])

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    setDescription(AUTO_DESCRIPTIONS[type] ?? '')
  }

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleClose = () => {
    setSelectedType('low_gross')
    setDescription('Low Gross')
    setAmount('')
    setTeeTimeId('')
    setSelectedParticipants([])
    setError('')
    onClose()
  }

  const parsedAmount = parseFloat(amount)
  const pot = isNaN(parsedAmount) ? 0 : parsedAmount * selectedParticipants.length
  const canSubmit =
    description.trim().length > 0 &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    selectedParticipants.length >= 2 &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/trips/${tripId}/golf/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bet_type: selectedType,
          amount: parsedAmount,
          description: description.trim(),
          tee_time_id: teeTimeId || null,
          participants: selectedParticipants,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create bet')
        return
      }
      onAdded(data.bet)
      handleClose()
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const meta = BET_TYPES[selectedType]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogHeader>
        <DialogTitle>Add a Bet</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-5">
          {/* Bet type grid */}
          <div>
            <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A99985]">
              Bet Type
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(BET_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeSelect(key)}
                  className={`flex flex-col items-center gap-1 rounded-[5px] border p-2 text-center transition-all ${
                    selectedType === key
                      ? 'border-[#4A7C59] bg-[#4A7C59]/5'
                      : 'border-[#DAD2BC] bg-white hover:border-[#A99985]'
                  }`}
                >
                  <span className="text-2xl">{info.emoji}</span>
                  <span className="text-xs font-medium text-[#252323] leading-tight">{info.label}</span>
                </button>
              ))}
            </div>
            {meta && (
              <p className="mt-2 text-sm italic text-[#A99985]">{meta.desc}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="bet-description">Description</Label>
            <Input
              id="bet-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Nassau Front 9"
              className="mt-1"
            />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="bet-amount">Amount</Label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A99985]">
                $
              </span>
              <Input
                id="bet-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="5.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="mt-1 text-xs text-[#A99985]">per person</p>
          </div>

          {/* Tee Time */}
          <div>
            <Label htmlFor="bet-tee-time">Tee Time (optional)</Label>
            <select
              id="bet-tee-time"
              value={teeTimeId}
              onChange={(e) => setTeeTimeId(e.target.value)}
              className="mt-1 flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#252323] focus:border-[#70798C] focus:outline-none focus:ring-2 focus:ring-[#70798C] focus:ring-opacity-15"
            >
              <option value="">None (applies to full trip)</option>
              {teeTimes.map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.course_name} — {formatTeeTime(tt.tee_time)}
                </option>
              ))}
            </select>
          </div>

          {/* Participants */}
          <div>
            <Label className="mb-2 block">Participants</Label>
            <div className="space-y-2">
              {members.map((m) => (
                <label key={m.user_id} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(m.user_id)}
                    onChange={() => toggleParticipant(m.user_id)}
                    className="h-4 w-4 rounded accent-[#4A7C59]"
                  />
                  <span className="text-sm text-[#252323]">
                    {m.display_name || m.email}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Pot preview */}
          {parsedAmount > 0 && selectedParticipants.length >= 2 && (
            <div className="rounded-[5px] border border-[#4A7C59]/20 bg-[#4A7C59]/5 px-4 py-2.5">
              <p className="text-sm text-[#4A7C59]">
                Pot: {selectedParticipants.length} players × ${parsedAmount.toFixed(2)} = ${pot.toFixed(2)}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-[#8B4444]">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 bg-[#4A7C59] text-white hover:bg-[#3d6b4a]"
            >
              {submitting ? 'Adding…' : 'Add Bet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── SettleBetDialog ──────────────────────────────────────────────────────────

interface SettleBetDialogProps {
  bet: BetEntry | null
  onClose: () => void
  tripId: string
  members: Member[]
  scores: Score[]
  onSettled: (bet: BetEntry) => void
}

function SettleBetDialog({ bet, onClose, tripId, members, scores, onSettled }: SettleBetDialogProps) {
  const [winnerId, setWinnerId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const autoWinnerId = bet ? getAutoWinner(bet, scores) : null

  useEffect(() => {
    if (bet) {
      setWinnerId(autoWinnerId || '')
      setError('')
    }
  }, [bet, autoWinnerId])

  if (!bet) return null

  const meta = BET_TYPES[bet.bet_type] ?? { label: bet.bet_type, emoji: '🎲', desc: '' }
  const participants = bet.participants.map((uid) => {
    const m = members.find((m) => m.user_id === uid)
    return { user_id: uid, display_name: m?.display_name || m?.email || uid }
  })

  const losers = bet.participants.filter((p) => p !== winnerId)
  const pot = bet.amount * losers.length
  const winnerName = participants.find((p) => p.user_id === winnerId)?.display_name || ''

  const autoWinnerScore = autoWinnerId
    ? scores.find((s) => s.tee_time_id === bet.tee_time_id && s.user_id === autoWinnerId)
    : null
  const autoWinnerMember = autoWinnerId ? members.find((m) => m.user_id === autoWinnerId) : null
  const autoWinnerName = autoWinnerMember?.display_name || autoWinnerMember?.email || ''

  const handleSubmit = async () => {
    if (!winnerId || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/trips/${tripId}/golf/bets/${bet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: winnerId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to settle bet')
        return
      }
      onSettled(data.bet)
      onClose()
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={!!bet} onOpenChange={(v) => !v && onClose()}>
      <DialogHeader>
        <DialogTitle>Settle: {bet.description}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-5">
          {/* Bet info */}
          <div className="rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED]/50 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{meta.emoji}</span>
              <span className="font-semibold text-[#252323]">{meta.label}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#A99985]">
              <span>${bet.amount}/person</span>
              <span>{bet.participants.length} participants</span>
              <span>${(bet.amount * (bet.participants.length - 1)).toFixed(2)} total pot</span>
            </div>
          </div>

          {/* Auto-detected winner */}
          {autoWinnerId && (
            <div className="rounded-[5px] border border-[#4A7C59]/20 bg-[#4A7C59]/5 p-3">
              <p className="text-sm font-medium text-[#4A7C59]">
                📊 Auto-detected: {autoWinnerName}
                {autoWinnerScore && (
                  <span className="ml-1 font-normal">
                    ({bet.bet_type === 'low_net'
                      ? `net ${autoWinnerScore.score - (autoWinnerScore.handicap || 0)}`
                      : `gross ${autoWinnerScore.score}`})
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-[#A99985]">
                Based on {bet.tee_time?.course_name || 'round'} scores — override below if needed.
              </p>
            </div>
          )}

          {/* Winner selector */}
          <div>
            <Label htmlFor="settle-winner">Who won?</Label>
            <select
              id="settle-winner"
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value)}
              className="mt-1 flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#252323] focus:border-[#70798C] focus:outline-none focus:ring-2 focus:ring-[#70798C] focus:ring-opacity-15"
            >
              <option value="">— Select a winner —</option>
              {participants.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Settlement preview */}
          {winnerId && (
            <div className="rounded-[5px] border border-[#4A7C59]/20 bg-[#4A7C59]/5 p-4 space-y-1">
              <p className="font-medium text-[#4A7C59]">🏆 {winnerName} wins ${pot.toFixed(2)}</p>
              <p className="text-sm text-[#252323]">
                {losers.length} {losers.length === 1 ? 'player' : 'players'} each owe ${bet.amount.toFixed(2)}
              </p>
              <p className="text-xs text-[#A99985]">→ Added to Expenses tab automatically</p>
            </div>
          )}

          {error && <p className="text-sm text-[#8B4444]">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!winnerId || submitting}
              className="flex-1 bg-[#4A7C59] text-white hover:bg-[#3d6b4a]"
            >
              {submitting ? 'Settling…' : 'Settle & Add to Expenses'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── GolfBets (main component) ────────────────────────────────────────────────

interface GolfBetsProps {
  tripId: string
}

export function GolfBets({ tripId }: GolfBetsProps) {
  const [bets, setBets] = useState<BetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [teeTimes, setTeeTimes] = useState<TeeTimeOption[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [settlingBet, setSettlingBet] = useState<BetEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [betsRes, membersRes, teeTimesRes, scoresRes] = await Promise.all([
        fetch(`/api/trips/${tripId}/golf/bets`),
        fetch(`/api/trips/${tripId}/members`),
        fetch(`/api/trips/${tripId}/golf/tee-times`),
        fetch(`/api/trips/${tripId}/golf/scores`),
      ])

      const [betsData, membersData, teeTimesData, scoresData] = await Promise.all([
        betsRes.json(),
        membersRes.json(),
        teeTimesRes.json(),
        scoresRes.json(),
      ])

      if (betsData.bets) setBets(betsData.bets)

      if (membersData.members) {
        const mapped: Member[] = membersData.members.map((m: any) => ({
          user_id: m.profiles?.id || m.user_id,
          display_name: m.profiles?.display_name || m.profiles?.email || m.profiles?.id || 'Unknown',
          email: m.profiles?.email || '',
        }))
        setMembers(mapped)
      }

      if (teeTimesData.teeTimes) setTeeTimes(teeTimesData.teeTimes)
      if (scoresData.scores) setScores(scoresData.scores)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleBetAdded = (bet: BetEntry) => {
    setBets((prev) => [bet, ...prev])
  }

  const handleBetSettled = (updatedBet: BetEntry) => {
    setBets((prev) => prev.map((b) => (b.id === updatedBet.id ? updatedBet : b)))
  }

  const handleDeleteConfirm = async (id: string) => {
    setDeleteError('')
    try {
      const res = await fetch(`/api/trips/${tripId}/golf/bets/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error || 'Failed to delete')
        return
      }
      setBets((prev) => prev.filter((b) => b.id !== id))
      setDeletingId(null)
    } catch {
      setDeleteError('Something went wrong')
    }
  }

  const openBets = bets.filter((b) => b.status === 'open')
  const settledBets = bets.filter((b) => b.status === 'settled')

  return (
    <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#252323]">Golf Bets</h3>
        <Button
          size="sm"
          onClick={() => setShowAdd(true)}
          className="bg-[#4A7C59] text-white hover:bg-[#3d6b4a]"
        >
          + Add Bet
        </Button>
      </div>

      {deleteError && (
        <p className="mb-3 text-sm text-[#8B4444]">{deleteError}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[5px] bg-[#F5F1ED]" />
          ))}
        </div>
      ) : bets.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-4xl">🎰</div>
          <p className="mt-2 font-medium text-[#252323]">No bets yet</p>
          <p className="mt-1 text-sm text-[#A99985]">
            Add a bet to track side action and settle up after your rounds.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {openBets.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#A99985]">
                Open
              </p>
              <div className="space-y-3">
                {openBets.map((bet) => (
                  <BetCard
                    key={bet.id}
                    bet={bet}
                    members={members}
                    deletingId={deletingId}
                    onSettle={setSettlingBet}
                    onDeleteRequest={(id) => {
                      setDeletingId(id)
                      setDeleteError('')
                    }}
                    onDeleteConfirm={handleDeleteConfirm}
                    onDeleteCancel={() => setDeletingId(null)}
                  />
                ))}
              </div>
            </div>
          )}

          {settledBets.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#A99985]">
                Settled
              </p>
              <div className="space-y-3">
                {settledBets.map((bet) => (
                  <BetCard
                    key={bet.id}
                    bet={bet}
                    members={members}
                    deletingId={deletingId}
                    onSettle={setSettlingBet}
                    onDeleteRequest={(id) => {
                      setDeletingId(id)
                      setDeleteError('')
                    }}
                    onDeleteConfirm={handleDeleteConfirm}
                    onDeleteCancel={() => setDeletingId(null)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddBetDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        tripId={tripId}
        members={members}
        teeTimes={teeTimes}
        onAdded={handleBetAdded}
      />

      <SettleBetDialog
        bet={settlingBet}
        onClose={() => setSettlingBet(null)}
        tripId={tripId}
        members={members}
        scores={scores}
        onSettled={handleBetSettled}
      />
    </div>
  )
}
