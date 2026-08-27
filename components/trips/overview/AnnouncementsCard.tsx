'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  created_by_profile: {
    display_name: string | null
    email: string
  }
}

interface AnnouncementsCardProps {
  tripId: string
  isOrganizer: boolean
}

export function AnnouncementsCard({ tripId, isOrganizer }: AnnouncementsCardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [tripId])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/announcements`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setPosting(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post')
      }

      toast.success('Announcement posted!')
      setTitle('')
      setContent('')
      setShowForm(false)
      fetchAnnouncements()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setPosting(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1C1A17]">Announcements</h3>
        {isOrganizer && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm font-medium text-[#3B6D11] transition-colors hover:text-[#1C1A17]"
          >
            {showForm ? 'Cancel' : 'Post Update'}
          </button>
        )}
      </div>

      {/* Post form */}
      {showForm && (
        <form onSubmit={handlePost} className="mb-4 space-y-2 rounded-[5px] bg-[#F5F1ED] p-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-1.5 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
          />
          <textarea
            placeholder="Details (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-1.5 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
          />
          <button
            type="submit"
            disabled={posting}
            className="rounded-[5px] bg-[#3B6D11] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2F5A0E]"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-[#6B6460]">Loading...</p>
      ) : announcements.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-[#6B6460]">No announcements yet</p>
          {isOrganizer && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#1C1A17] transition-colors hover:bg-[#F5F1ED]"
            >
              Post Update
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="border-b border-[#F5F1ED] pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-[#1C1A17]">{a.title}</p>
                {a.is_pinned && (
                  <span className="shrink-0 text-xs text-[#B8956A]">Pinned</span>
                )}
              </div>
              {a.content && (
                <p className="mt-0.5 text-xs text-[#6B6460] line-clamp-2">{a.content}</p>
              )}
              <p className="mt-1 text-[10px] text-[#DAD2BC]">
                {a.created_by_profile?.display_name || 'Organizer'} &middot; {timeAgo(a.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
