'use client'

import { parseLocalDate, formatTime } from '@/lib/dates'
import { toast } from 'sonner'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'

interface DraftedItem {
  date: string
  time: string | null
  title: string
  item_type: string
  location: string | null
  description: string | null
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  tee_time: 'Tee time',
  lodging: 'Lodging',
  meal: 'Meal',
  travel: 'Travel',
}

/** 'other' renders nothing — an unlabelled card reads as a plain activity. */
function EventTypeBadge({ type }: { type?: string }) {
  const label = type ? EVENT_TYPE_LABELS[type] : null
  if (!label) return null
  return (
    <span className="shrink-0 rounded-full bg-[#F5F1ED] px-2 py-0.5 text-[10px] font-medium text-[#3B6D11]">
      {label}
    </span>
  )
}

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddItemDialog } from '@/components/itinerary/AddItemDialog'
import { CommentSection } from '@/components/itinerary/CommentSection'
import { SuggestActivityDialog } from '@/components/itinerary/SuggestActivityDialog'
import { SuggestionList } from '@/components/itinerary/SuggestionList'
import { useItinerary, type ItineraryItem } from '@/lib/hooks/useItinerary'
import { useSuggestions } from '@/lib/hooks/useSuggestions'

interface ItineraryTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function ItineraryTab({ tripId, trip, currentUserId, isOrganizer }: ItineraryTabProps) {
  const { items, loading, error } = useItinerary(tripId)
  const { suggestions, loading: suggestionsLoading } = useSuggestions(tripId)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // A.3 — the empty itinerary is a dead end: it asks for a day-by-day schedule and
  // gives you a blank page. Suggestions are shown for review and saved one at a time;
  // nothing is written without the organiser choosing it.
  const [drafting, setDrafting] = useState(false)
  const [drafted, setDrafted] = useState<DraftedItem[] | null>(null)
  const [savingAll, setSavingAll] = useState(false)

  const draftItinerary = async () => {
    setDrafting(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/ai/itinerary-draft`, { method: 'POST' })
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not draft that'))
      const { items: suggested } = await res.json()
      if (!suggested?.length) {
        toast.error('Nothing came back — add activities manually below.')
        return
      }
      setDrafted(suggested)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDrafting(false)
    }
  }

  const keepAll = async () => {
    if (!drafted) return
    setSavingAll(true)
    let saved = 0
    for (const item of drafted) {
      try {
        const res = await fetch(`/api/trips/${tripId}/itinerary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            date: item.date,
            time: item.time,
            location: item.location,
            description: item.description,
            item_type: item.item_type,
          }),
        })
        if (res.ok) saved += 1
      } catch {
        // Keep going: one bad item should not cost the organiser the rest of the draft.
      }
    }
    setSavingAll(false)
    setDrafted(null)
    // Reports what actually happened rather than assuming a clean run.
    toast.success(`Added ${saved} of ${drafted.length}`)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this activity?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete item')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  const toggleComments = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  // Group items by date
  const itemsByDate = items.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = []
    }
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  const dates = Object.keys(itemsByDate).sort()

  if (loading) {
    return <p className="text-[#6B6460]">Loading itinerary...</p>
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
    )
  }

  const pendingSuggestionCount = suggestions.filter((s) => s.status === 'pending').length

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1A17]">Itinerary</h2>
          <p className="text-[#6B6460]">Plan your day-by-day schedule for {trip.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <SuggestActivityDialog tripId={tripId} />
          {isOrganizer && <AddItemDialog tripId={tripId} onSuccess={() => {}} />}
        </div>
      </div>

      {/* Activity Suggestions Section */}
      {(suggestions.length > 0 || !suggestionsLoading) && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Activity Suggestions
                {pendingSuggestionCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                    {pendingSuggestionCount} pending
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Members can suggest activities for the organizer to approve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuggestionList
                suggestions={suggestions}
                tripId={tripId}
                isOrganizer={isOrganizer}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drafted suggestions, held for review — never auto-saved. */}
      {drafted && drafted.length > 0 && (
        <div className="mb-8 rounded-[5px] border border-[#3B6D11] bg-[#EAF3DE] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#1C1A17]">
              {drafted.length} suggested — keep what works
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={keepAll} disabled={savingAll}>
                {savingAll ? 'Adding…' : 'Keep all'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDrafted(null)} disabled={savingAll}>
                Discard
              </Button>
            </div>
          </div>
          <ul className="space-y-1.5">
            {drafted.map((d, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 text-sm text-[#1C1A17]">
                <span className="text-[#6B6460]">
                  {parseLocalDate(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {d.time ? ` · ${formatTime(d.time)}` : ''}
                </span>
                <span className="font-medium">{d.title}</span>
                {d.location && <span className="text-[#6B6460]">· {d.location}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Day-by-day itinerary */}
      {dates.length === 0 ? (
        <div className="rounded-[5px] border-2 border-dashed border-[#DAD2BC] p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1ED]">
            <svg className="h-6 w-6 text-[#6B6460]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#1C1A17]">Nothing scheduled yet</h3>
          <p className="mt-1 mb-4 text-sm text-[#6B6460]">
            Rounds, dinners, check-ins, travel — the day-by-day the group will follow.
          </p>
          {isOrganizer && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={draftItinerary} disabled={drafting}>
                {drafting ? 'Drafting…' : 'Draft my itinerary'}
              </Button>
              <AddItemDialog tripId={tripId} onSuccess={() => {}} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date}>
              <h3 className="mb-4 text-xl font-bold text-[#1C1A17]">
                {parseLocalDate(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="space-y-4">
                {itemsByDate[date].map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle>{item.title}</CardTitle>
                            <EventTypeBadge type={item.item_type} />
                          </div>
                          <CardDescription className="mt-1 space-y-1">
                            {item.time && (
                              <div>
                                {formatTime(item.time)}
                                {item.end_time ? ` – ${formatTime(item.end_time)}` : ''}
                              </div>
                            )}
                            {(item.address || item.location) && (
                              <div>{item.address || item.location}</div>
                            )}
                            {item.item_type === 'tee_time' && (
                              <div>
                                {item.num_players || 4} players
                                {item.par ? ` · Par ${item.par}` : ''}
                                {item.booking_confirmation
                                  ? ` · Conf ${item.booking_confirmation}`
                                  : ''}
                              </div>
                            )}
                          </CardDescription>
                        </div>
                        {isOrganizer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="mb-4 text-[#6B6460]">{item.description}</p>
                      )}

                      {/* Comments toggle */}
                      <div className="border-t border-[#DAD2BC] pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(item.id)}
                          className="mb-3"
                        >
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {expandedItems.has(item.id) ? 'Hide Comments' : 'Show Comments'}
                        </Button>

                        {expandedItems.has(item.id) && (
                          <div className="rounded-lg bg-[#F5F1ED] p-4">
                            <CommentSection
                              tripId={tripId}
                              itineraryItemId={item.id}
                              currentUserId={currentUserId}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
