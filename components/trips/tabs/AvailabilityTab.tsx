'use client'

import { PuttingCountdown } from '@/components/trips/PuttingCountdown'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AvailabilityTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function AvailabilityTab({ tripId, trip, currentUserId, isOrganizer }: AvailabilityTabProps) {
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showAvailForm, setShowAvailForm] = useState(false)
  const [showAnnounceForm, setShowAnnounceForm] = useState(false)
  const [availForm, setAvailForm] = useState({ start_date: '', end_date: '' })
  const [announceForm, setAnnounceForm] = useState({ title: '', content: '', is_pinned: false })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [tripId])

  async function fetchData() {
    setLoading(true)
    try {
      const [availRes, announceRes] = await Promise.all([
        fetch(`/api/trips/${tripId}/availability`),
        fetch(`/api/trips/${tripId}/announcements`),
      ])
      if (availRes.ok) {
        const data = await availRes.json()
        setAvailability(data.availability || [])
      }
      if (announceRes.ok) {
        const data = await announceRes.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  async function handleAddAvailability(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availForm),
      })
      if (!res.ok) throw new Error('Failed to add availability')
      setAvailForm({ start_date: '', end_date: '' })
      setShowAvailForm(false)
      fetchData()
      toast.success('Availability added')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteAvailability(id: string) {
    try {
      const res = await fetch(`/api/trips/${tripId}/availability/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announceForm),
      })
      if (!res.ok) throw new Error('Failed to post')
      setAnnounceForm({ title: '', content: '', is_pinned: false })
      setShowAnnounceForm(false)
      fetchData()
      toast.success('Announcement posted')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    try {
      const res = await fetch(`/api/trips/${tripId}/announcements/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function togglePin(id: string, currentPinned: boolean) {
    try {
      const res = await fetch(`/api/trips/${tripId}/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !currentPinned }),
      })
      if (!res.ok) throw new Error('Failed')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  function calculateBestDates() {
    if (availability.length === 0) return []
    const dateCounts: Record<string, number> = {}
    availability.forEach((entry) => {
      const start = new Date(entry.start_date + 'T00:00:00')
      const end = new Date(entry.end_date + 'T00:00:00')
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0]
        dateCounts[key] = (dateCounts[key] || 0) + 1
      }
    })
    const total = trip?.trip_members?.length || 1
    return Object.entries(dateCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([date, count]) => ({
        date,
        count,
        percentage: Math.round((count / total) * 100),
      }))
  }

  const fmt = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const fmtFull = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const bestDates = calculateBestDates()
  const myAvailability = availability.filter((a) => a.user_id === currentUserId)
  const othersAvailability = availability.filter((a) => a.user_id !== currentUserId)
  const memberCount = trip?.trip_members?.length || 0

  if (loading) {
    return <p className="text-sm text-[#A99985]">Loading...</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Left: Availability */}
      <div className="space-y-6">
        {/* Best Dates */}
        {bestDates.length > 0 && (
          <div className="rounded-[8px] border-2 border-[#70798C] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="mb-1 text-lg font-semibold text-[#252323]">Best Dates</h3>
            <p className="mb-4 text-sm text-[#A99985]">Dates when the most people are free</p>
            <div className="space-y-2">
              {bestDates.map((item, idx) => (
                <div key={item.date} className="flex items-center gap-3 rounded-[5px] border border-[#DAD2BC] p-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#252323]">{fmtFull(item.date)}</p>
                      {idx === 0 && (
                        <span className="rounded-full bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs font-semibold text-[#4A7C59]">
                          Best
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F5F1ED]">
                        <div
                          className="h-full rounded-full bg-[#4A7C59]"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#A99985]">
                        {item.count}/{memberCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Availability */}
        <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#252323]">Your Availability</h3>
            {!showAvailForm && (
              <button
                onClick={() => setShowAvailForm(true)}
                className="rounded-[5px] bg-[#70798C] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5A6270]"
              >
                + Add Dates
              </button>
            )}
          </div>

          {showAvailForm && (
            <form
              onSubmit={handleAddAvailability}
              className="mb-4 space-y-3 rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED] p-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="avail_start">From</Label>
                  <Input
                    id="avail_start"
                    type="date"
                    value={availForm.start_date}
                    onChange={(e) => setAvailForm({ ...availForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="avail_end">To</Label>
                  <Input
                    id="avail_end"
                    type="date"
                    value={availForm.end_date}
                    onChange={(e) => setAvailForm({ ...availForm, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-[5px] bg-[#70798C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A6270] disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAvailForm(false)}
                  className="rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {myAvailability.length === 0 ? (
            <div className="rounded-[5px] border-2 border-dashed border-[#DAD2BC] py-10 text-center">
              <p className="text-sm text-[#A99985]">You haven't added your availability yet</p>
              <p className="mt-1 text-xs text-[#DAD2BC]">Let the group know when you're free</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myAvailability.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-[5px] border border-[#DAD2BC] p-3"
                >
                  <p className="text-sm font-medium text-[#252323]">
                    {fmt(entry.start_date)} – {fmt(entry.end_date)}
                  </p>
                  <button
                    onClick={() => handleDeleteAvailability(entry.id)}
                    className="text-xs text-[#8B4444] transition-colors hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group Availability */}
        {othersAvailability.length > 0 && (
          <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="mb-4 text-lg font-semibold text-[#252323]">Group Availability</h3>
            <div className="space-y-2">
              {othersAvailability.map((entry) => (
                <div key={entry.id} className="rounded-[5px] border border-[#DAD2BC] p-3">
                  <p className="text-xs font-semibold text-[#70798C]">
                    {entry.user?.display_name || entry.user?.email}
                  </p>
                  <p className="mt-0.5 text-sm text-[#252323]">
                    {fmt(entry.start_date)} – {fmt(entry.end_date)}
                  </p>
                  {entry.notes && (
                    <p className="mt-0.5 text-xs text-[#A99985]">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for group when no one has submitted */}
        {othersAvailability.length === 0 && myAvailability.length > 0 && (
          <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 text-center">
            <p className="text-sm text-[#A99985]">
              Waiting for others to submit their availability
            </p>
          </div>
        )}
      </div>

      {/* Right: Announcements */}
      <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#252323]">Announcements</h3>
          {isOrganizer && !showAnnounceForm && (
            <button
              onClick={() => setShowAnnounceForm(true)}
              className="rounded-[5px] bg-[#70798C] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5A6270]"
            >
              + Post
            </button>
          )}
        </div>

        {showAnnounceForm && (
          <form
            onSubmit={handleAddAnnouncement}
            className="mb-4 space-y-3 rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED] p-4"
          >
            <div>
              <Label htmlFor="ann_title">Title</Label>
              <Input
                id="ann_title"
                value={announceForm.title}
                onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                placeholder="Important update"
                required
              />
            </div>
            <div>
              <Label htmlFor="ann_content">Message</Label>
              <textarea
                id="ann_content"
                value={announceForm.content}
                onChange={(e) => setAnnounceForm({ ...announceForm, content: e.target.value })}
                placeholder="Share details with the group..."
                required
                rows={3}
                className="flex w-full rounded-[5px] border border-[#CEC5B0] bg-white px-3 py-2 text-sm focus:border-[#70798C] focus:outline-none focus:ring-2 focus:ring-[#70798C] focus:ring-opacity-15"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_pinned"
                checked={announceForm.is_pinned}
                onChange={(e) => setAnnounceForm({ ...announceForm, is_pinned: e.target.checked })}
                className="h-4 w-4 rounded border-[#DAD2BC]"
              />
              <Label htmlFor="is_pinned">Pin this announcement</Label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-[5px] bg-[#70798C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A6270] disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
              <button
                type="button"
                onClick={() => setShowAnnounceForm(false)}
                className="rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {announcements.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[#A99985]">
              {isOrganizer
                ? 'Post an update to keep the group informed'
                : 'No announcements yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`rounded-[5px] border p-4 ${
                  ann.is_pinned ? 'border-[#70798C] bg-[#F5F1ED]' : 'border-[#DAD2BC]'
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {ann.is_pinned && (
                      <span className="mb-1 inline-block rounded-full bg-[#70798C] px-2 py-0.5 text-xs font-semibold text-white">
                        📌 Pinned
                      </span>
                    )}
                    <h4 className="font-semibold text-[#252323]">{ann.title}</h4>
                  </div>
                  {ann.created_by === currentUserId && (
                    <div className="flex shrink-0 gap-3">
                      <button
                        onClick={() => togglePin(ann.id, ann.is_pinned)}
                        className="text-xs text-[#70798C] transition-colors hover:text-[#252323]"
                      >
                        {ann.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-xs text-[#8B4444] transition-colors hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-[#A99985]">{ann.content}</p>
                <p className="mt-2 text-xs text-[#DAD2BC]">
                  {ann.created_by_profile?.display_name || ann.created_by_profile?.email} ·{' '}
                  {new Date(ann.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {trip.start_date && (
        <PuttingCountdown
          tripStart={trip.start_date}
          tripLabel={[
            trip.end_date
              ? `${new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            trip.destination,
          ].filter(Boolean).join(' · ')}
        />
      )}
    </div>
  )
}
