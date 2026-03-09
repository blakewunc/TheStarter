'use client'

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
    return <p className="text-[#A99985]">Loading itinerary...</p>
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
          <h2 className="text-2xl font-bold tracking-tight text-[#252323]">Itinerary</h2>
          <p className="text-[#A99985]">Plan your day-by-day schedule for {trip.title}</p>
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

      {/* Day-by-day itinerary */}
      {dates.length === 0 ? (
        <div className="rounded-[5px] border-2 border-dashed border-[#DAD2BC] p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1ED]">
            <svg className="h-6 w-6 text-[#A99985]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#252323]">No activities planned yet</h3>
          <p className="mt-1 mb-4 text-sm text-[#A99985]">
            Build out the day-by-day schedule — tee times, dinners, check-ins, activities.
          </p>
          {isOrganizer && <AddItemDialog tripId={tripId} onSuccess={() => {}} />}
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date}>
              <h3 className="mb-4 text-xl font-bold text-[#252323]">
                {new Date(date).toLocaleDateString('en-US', {
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
                          <CardTitle>{item.title}</CardTitle>
                          <CardDescription className="mt-1 space-y-1">
                            {item.time && <div>{'\u{1F550}'} {item.time}</div>}
                            {item.location && <div>{'\u{1F4CD}'} {item.location}</div>}
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
                        <p className="mb-4 text-[#A99985]">{item.description}</p>
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
