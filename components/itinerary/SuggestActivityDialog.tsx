'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SuggestActivityDialogProps {
  tripId: string
  onSuccess?: () => void
}

export function SuggestActivityDialog({ tripId, onSuccess }: SuggestActivityDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSubmitting(true)
    try {
      const payload: any = { title: formData.title.trim() }
      if (formData.description.trim()) payload.description = formData.description.trim()
      if (formData.date) payload.date = formData.date
      if (formData.time) payload.time = formData.time
      if (formData.location.trim()) payload.location = formData.location.trim()

      const response = await fetch(`/api/trips/${tripId}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to submit suggestion')

      toast.success('Activity suggested!')
      setFormData({ title: '', description: '', date: '', time: '', location: '' })
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Suggest Activity
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Suggest an Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1C1A17]">
              Activity Name <span className="text-[#8B4444]">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Beach volleyball"
              required
              className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1C1A17]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional details about the activity..."
              rows={3}
              className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1C1A17]">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1C1A17]">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1C1A17]">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Optional location"
              className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm text-[#1C1A17] placeholder-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-1 focus:ring-[#1C1A17]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
