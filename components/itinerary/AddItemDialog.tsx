'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'
import { CoursePicker, type Course } from '@/components/golf/CoursePicker'

interface AddItemDialogProps {
  tripId: string
  onSuccess: () => void
  /** "lat,lng" of the trip destination, used to bias course search. Optional. */
  near?: string | null
}

const EVENT_TYPES = [
  { value: 'tee_time', label: 'Tee time' },
  { value: 'lodging', label: 'Lodging' },
  { value: 'meal', label: 'Meal' },
  { value: 'travel', label: 'Travel' },
  { value: 'other', label: 'Other' },
] as const

type EventType = (typeof EVENT_TYPES)[number]['value']

const EMPTY = {
  title: '',
  description: '',
  location: '',
  date: '',
  time: '',
  end_time: '',
  num_players: '4',
  par: '72',
  booking_confirmation: '',
}

export function AddItemDialog({ tripId, onSuccess, near }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [itemType, setItemType] = useState<EventType>('other')
  const [formData, setFormData] = useState(EMPTY)
  const [courseName, setCourseName] = useState('')
  const [course, setCourse] = useState<Course | null>(null)

  const isTeeTime = itemType === 'tee_time'

  const resetAll = () => {
    setFormData(EMPTY)
    setCourseName('')
    setCourse(null)
    setItemType('other')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // For a tee time the course name is the event title, so the itinerary reads
    // correctly whether or not the viewer cares about the type.
    const title = isTeeTime ? courseName.trim() : formData.title.trim()

    const payload: Record<string, unknown> = {
      item_type: itemType,
      title,
      description: formData.description || null,
      date: formData.date,
      time: formData.time || null,
      end_time: formData.end_time || null,
      location: formData.location || null,
    }

    if (isTeeTime) {
      Object.assign(payload, {
        // Null course_id is a supported outcome — free text still saves.
        course_id: course?.id ?? null,
        course_name: courseName.trim(),
        address: course?.address ?? formData.location ?? null,
        lat: course?.lat ?? null,
        lng: course?.lng ?? null,
        timezone: course?.timezone ?? null,
        num_players: parseInt(formData.num_players) || 4,
        par: parseInt(formData.par) || course?.par || 72,
        booking_confirmation: formData.booking_confirmation || null,
      })
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add item')
      }

      resetAll()
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Activity</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-[#252323]">Add Activity</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#252323]">Type</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setItemType(t.value)}
                      className={`rounded-[5px] border px-3 py-1.5 text-sm transition-colors ${
                        itemType === t.value
                          ? 'border-[#70798C] bg-[#70798C] text-white'
                          : 'border-[#DAD2BC] bg-white text-[#252323] hover:bg-[#F5F1ED]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {isTeeTime ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Course*
                  </label>
                  <CoursePicker
                    value={courseName}
                    onChange={setCourseName}
                    onSelectCourse={setCourse}
                    near={near}
                    required
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-[#A99985]">
                    {course
                      ? [course.city, course.state].filter(Boolean).join(', ') ||
                        'Course selected'
                      : 'Not finding it? Just type the name — it saves either way.'}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Activity Name*
                  </label>
                  <Input
                    required
                    placeholder="e.g., Dinner at the clubhouse"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                  Description
                </label>
                <Textarea
                  placeholder="Add details about this activity..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* A matched course supplies its own address, so only ask when it can't. */}
              {(!isTeeTime || !course) && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Location
                  </label>
                  <Input
                    placeholder="e.g., Pebble Beach, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">Date*</label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">Ends</label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              {isTeeTime && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                      Players
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="4"
                      value={formData.num_players}
                      onChange={(e) =>
                        setFormData({ ...formData, num_players: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#252323]">Par</label>
                    <Input
                      type="number"
                      min="60"
                      max="80"
                      value={formData.par}
                      onChange={(e) => setFormData({ ...formData, par: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                      Confirmation
                    </label>
                    <Input
                      placeholder="Optional"
                      value={formData.booking_confirmation}
                      onChange={(e) =>
                        setFormData({ ...formData, booking_confirmation: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Activity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  )
}
