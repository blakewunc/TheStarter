'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { parseLocalDate } from '@/lib/dates'
import type { Suggestion } from '@/lib/hooks/useSuggestions'

interface SuggestionListProps {
  suggestions: Suggestion[]
  tripId: string
  isOrganizer: boolean
  currentUserId: string | null
}

export function SuggestionList({ suggestions, tripId, isOrganizer, currentUserId }: SuggestionListProps) {
  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending')
  const decidedSuggestions = suggestions.filter((s) => s.status !== 'pending')

  const handleApprove = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to approve')

      toast.success('Suggestion approved and added to itinerary!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleReject = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to reject')

      toast.success('Suggestion rejected')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (suggestionId: string) => {
    if (!confirm('Delete this suggestion?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/suggestions/${suggestionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete')

      toast.success('Suggestion deleted')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700'
      case 'rejected':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-yellow-50 text-yellow-700'
    }
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-[5px] border border-dashed border-[#DAD2BC] p-6 text-center">
        <p className="text-sm text-[#6B6460]">No activity suggestions yet. Be the first to suggest one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#6B6460]">
            Pending Suggestions ({pendingSuggestions.length})
          </h4>
          {pendingSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isOrganizer={isOrganizer}
              currentUserId={currentUserId}
              onApprove={() => handleApprove(suggestion.id)}
              onReject={() => handleReject(suggestion.id)}
              onDelete={() => handleDelete(suggestion.id)}
              statusBadgeClass={getStatusBadge(suggestion.status)}
            />
          ))}
        </div>
      )}

      {/* Decided Suggestions */}
      {decidedSuggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#6B6460]">
            Reviewed ({decidedSuggestions.length})
          </h4>
          {decidedSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isOrganizer={isOrganizer}
              currentUserId={currentUserId}
              onApprove={() => handleApprove(suggestion.id)}
              onReject={() => handleReject(suggestion.id)}
              onDelete={() => handleDelete(suggestion.id)}
              statusBadgeClass={getStatusBadge(suggestion.status)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SuggestionCard({
  suggestion,
  isOrganizer,
  currentUserId,
  onApprove,
  onReject,
  onDelete,
  statusBadgeClass,
}: {
  suggestion: Suggestion
  isOrganizer: boolean
  currentUserId: string | null
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
  statusBadgeClass: string
}) {
  const isCreator = suggestion.suggested_by === currentUserId
  const suggestedByName = suggestion.profiles?.display_name || suggestion.profiles?.email || 'Unknown'

  return (
    <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-[#1C1A17]">{suggestion.title}</h5>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass}`}>
              {suggestion.status}
            </span>
          </div>

          {suggestion.description && (
            <p className="text-sm text-[#6B6460] mb-2">{suggestion.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-[#6B6460]">
            {suggestion.date && (
              <span>
                {parseLocalDate(suggestion.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            {suggestion.time && <span>{suggestion.time}</span>}
            {suggestion.location && <span>{suggestion.location}</span>}
            <span>by {suggestedByName}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-3">
          {/* Organizer approve/reject for pending */}
          {isOrganizer && suggestion.status === 'pending' && (
            <>
              <Button size="sm" onClick={onApprove} className="bg-[#3B6D11] hover:bg-[#3d6a4a] text-xs px-3">
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={onReject} className="text-xs px-3">
                Reject
              </Button>
            </>
          )}

          {/* Delete for creator or organizer */}
          {(isCreator || isOrganizer) && (
            <button
              onClick={onDelete}
              className="rounded-[5px] px-2 py-1 text-xs text-[#8B4444] hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
