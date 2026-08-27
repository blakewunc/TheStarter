'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useComments } from '@/lib/hooks/useComments'
import { formatDistanceToNow } from 'date-fns'

interface CommentSectionProps {
  tripId: string
  itineraryItemId: string
  currentUserId: string | null
}

export function CommentSection({ tripId, itineraryItemId, currentUserId }: CommentSectionProps) {
  const { comments, loading } = useComments(tripId, itineraryItemId)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          itinerary_item_id: itineraryItemId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add comment')
      }

      setNewComment('')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      const response = await fetch(
        `/api/trips/${tripId}/comments?comment_id=${commentId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete comment')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return <div className="text-sm text-[#6B6460]">Loading comments...</div>
  }

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-[#6B6460]">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-[#DAD2BC] bg-white p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1C1A17]">
                    {comment.profiles.display_name || comment.profiles.email}
                  </p>
                  <p className="text-xs text-[#6B6460]">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                {currentUserId === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </Button>
                )}
              </div>
              <p className="text-sm text-[#1C1A17]">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
