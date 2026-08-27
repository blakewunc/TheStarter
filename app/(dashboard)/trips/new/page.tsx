'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { DestinationPicker, type Destination } from '@/components/trips/DestinationPicker'
import { CoursePicker, type Course } from '@/components/golf/CoursePicker'

// Reuses the exact chips from The Club's round modal, so a format means the same
// thing whether it is set at trip creation or at the first tee.
const FORMATS = [
  { value: 'nassau', label: 'Nassau' },
  { value: 'skins', label: 'Skins' },
  { value: 'wolf', label: 'Wolf' },
  { value: 'stroke_play', label: 'Stroke play' },
] as const

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
    budget_total: '',
    expected_guests: '',
    rounds_planned: '',
    default_format: '' as '' | (typeof FORMATS)[number]['value'],
    stakes: '',
  })
  const [destination, setDestination] = useState<Destination | null>(null)
  const [courses, setCourses] = useState<string[]>([])
  const [courseDraft, setCourseDraft] = useState('')

  // Course search biases toward the destination once one is resolved, so typing
  // "pine" in Southern Pines surfaces the right Pinehurst courses first.
  const near =
    destination?.lat != null && destination?.lng != null
      ? `${destination.lat},${destination.lng}`
      : null

  const addCourse = (name: string) => {
    const clean = name.trim()
    if (!clean || courses.includes(clean)) {
      setCourseDraft('')
      return
    }
    setCourses((prev) => [...prev, clean])
    setCourseDraft('')
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data: Record<string, any> = {
      title: formData.title,
      destination: formData.destination,
      trip_type: 'golf',
      start_date: formData.start_date,
      end_date: formData.end_date,
    }
    if (formData.description) data.description = formData.description
    if (formData.budget_total) data.budget_total = parseFloat(formData.budget_total)
    if (formData.expected_guests) data.expected_guests = parseInt(formData.expected_guests)
    if (formData.rounds_planned) data.rounds_planned = parseInt(formData.rounds_planned)
    if (formData.default_format) data.default_format = formData.default_format
    if (formData.stakes) data.stakes = formData.stakes
    if (courses.length > 0) data.target_courses = courses

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create trip')
      }

      const { trip } = await response.json()
      router.push(`/trips/${trip.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl page-title tracking-tight text-[#1C1A17]">Plan your trip</h1>
          <p className="mt-1 text-[#6B6460]">Where&apos;s the crew headed?</p>
        </div>

        <Card id="trip-form">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Trip name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Pinehurst Boys Trip"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <DestinationPicker
                  id="destination"
                  value={formData.destination}
                  onChange={(v) => setFormData({ ...formData, destination: v })}
                  onSelect={setDestination}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-[#6B6460]">
                  {destination
                    ? `${destination.courseCount} ${destination.courseCount === 1 ? 'course' : 'courses'} near here`
                    : 'Suggestions come from towns with courses. Anywhere else still works — just type it.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expected_guests">How many players *</Label>
                  <Input
                    id="expected_guests"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.expected_guests}
                    onChange={(e) =>
                      setFormData({ ...formData, expected_guests: e.target.value })
                    }
                    placeholder="e.g., 8"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-[#6B6460]">What every cost gets split by</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rounds_planned">How many rounds</Label>
                  <Input
                    id="rounds_planned"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.rounds_planned}
                    onChange={(e) =>
                      setFormData({ ...formData, rounds_planned: e.target.value })
                    }
                    placeholder="e.g., 3"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courses">Courses you&apos;re hoping to play</Label>
                <CoursePicker
                  id="courses"
                  value={courseDraft}
                  onChange={setCourseDraft}
                  onSelectCourse={(c: Course | null) => {
                    if (c) addCourse(c.name)
                  }}
                  near={near}
                  disabled={loading}
                  placeholder="Start typing, or add your own"
                />
                {courseDraft.trim() && (
                  <button
                    type="button"
                    onClick={() => addCourse(courseDraft)}
                    className="text-xs font-medium text-[#3B6D11] underline-offset-2 hover:underline"
                  >
                    Add &ldquo;{courseDraft.trim()}&rdquo;
                  </button>
                )}
                {courses.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {courses.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3DE] px-3 py-1 text-xs font-medium text-[#3B6D11]"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => setCourses((prev) => prev.filter((x) => x !== c))}
                          aria-label={`Remove ${c}`}
                          className="text-[#3B6D11] hover:text-[#1C1A17]"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Default game format</Label>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => {
                    const active = formData.default_format === f.value
                    return (
                      <button
                        key={f.value}
                        type="button"
                        disabled={loading}
                        // Selecting the active chip clears it — the field is optional
                        // and there is otherwise no way back to "not set".
                        onClick={() =>
                          setFormData({
                            ...formData,
                            default_format: active ? '' : f.value,
                          })
                        }
                        className={`min-h-11 rounded-[5px] border px-4 text-sm transition-colors ${
                          active
                            ? 'border-[#3B6D11] bg-[#3B6D11] text-white'
                            : 'border-[#DAD2BC] bg-white text-[#1C1A17] hover:bg-[#F5F1ED]'
                        }`}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stakes">Stakes</Label>
                  <Input
                    id="stakes"
                    value={formData.stakes}
                    onChange={(e) => setFormData({ ...formData, stakes: e.target.value })}
                    placeholder="e.g., $10 per side"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_total">Total budget</Label>
                  <Input
                    id="budget_total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budget_total}
                    onChange={(e) =>
                      setFormData({ ...formData, budget_total: e.target.value })
                    }
                    placeholder="e.g., 5000"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Anything else</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Travel notes, who's driving, what the group cares about..."
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-[5px] bg-[#FEF2F2] p-3 text-sm text-[#8B4444]">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating…' : 'Create trip'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/trips')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
