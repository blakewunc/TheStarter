'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBrand } from '@/lib/BrandProvider'

const TEMPLATES = [
  {
    id: 'golf',
    icon: '⛳',
    name: 'Golf Weekend',
    description: 'Tee times, scorecards & expenses for the crew',
    defaults: { trip_type: 'golf', expected_guests: '4' },
  },
  {
    id: 'bachelor',
    icon: '🎉',
    name: 'Bachelor Party',
    description: 'Bars, activities & splitting costs made easy',
    defaults: { trip_type: 'bachelor_party', expected_guests: '8' },
  },
  {
    id: 'bachelorette',
    icon: '💃',
    name: 'Bachelorette Party',
    description: 'Itinerary, supplies & group coordination',
    defaults: { trip_type: 'bachelorette_party', expected_guests: '8' },
  },
  {
    id: 'ski',
    icon: '⛷️',
    name: 'Ski Weekend',
    description: 'Lift tickets, rentals & cabin coordination',
    defaults: { trip_type: 'ski', expected_guests: '6' },
  },
  {
    id: 'road_trip',
    icon: '🚗',
    name: 'Road Trip',
    description: 'Gas, stops & shared expenses on the road',
    defaults: { trip_type: 'general', expected_guests: '4' },
  },
  {
    id: 'blank',
    icon: '✈️',
    name: 'Blank Trip',
    description: 'Start from scratch with full customization',
    defaults: { trip_type: 'general', expected_guests: '' },
  },
]

export default function NewTripPage() {
  const router = useRouter()
  const brand = useBrand()
  const isStarter = brand.id === 'starter'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    trip_type: isStarter ? 'golf' : 'general',
    start_date: '',
    end_date: '',
    description: '',
    budget_total: '',
    expected_guests: '',
  })

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template.id)
    setFormData((prev) => ({ ...prev, ...template.defaults }))
    // Scroll to the form
    document.getElementById('trip-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data: Record<string, any> = {
      title: formData.title,
      destination: formData.destination,
      trip_type: formData.trip_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
    }
    if (formData.description) data.description = formData.description
    if (formData.budget_total) data.budget_total = parseFloat(formData.budget_total)
    if (formData.expected_guests) data.expected_guests = parseInt(formData.expected_guests)

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
          <h1 className="text-3xl font-bold tracking-tight text-[#252323]">Create a New Trip</h1>
          <p className="mt-1 text-[#A99985]">Start planning your next group adventure</p>
        </div>

        {/* Template Picker */}
        {!isStarter && (
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#70798C]">
              Start from a template
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={`rounded-[8px] border p-4 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-[#70798C] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
                      : 'border-[#DAD2BC] bg-white hover:border-[#70798C] hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <span className="text-2xl">{template.icon}</span>
                  <p className="mt-2 text-sm font-semibold text-[#252323]">{template.name}</p>
                  <p className="mt-0.5 text-xs text-[#A99985]">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <Card id="trip-form">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Fill in the details about your trip. You can edit everything later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Bachelor Party in Nashville"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., Nashville, TN"
                  required
                  disabled={loading}
                />
              </div>

              {isStarter ? (
                <input type="hidden" value="golf" />
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="trip_type">Trip Type *</Label>
                  <select
                    id="trip_type"
                    value={formData.trip_type}
                    onChange={(e) => setFormData({ ...formData, trip_type: e.target.value })}
                    disabled={loading}
                    className="flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#252323] transition-all focus:border-[#70798C] focus:outline-none focus:ring-2 focus:ring-[#70798C] focus:ring-opacity-15 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#F5F1ED]"
                  >
                    <option value="general">General Trip</option>
                    <option value="golf">⛳ Golf Trip</option>
                    <option value="ski">⛷️ Ski Trip</option>
                    <option value="bachelor_party">🎉 Bachelor Party</option>
                    <option value="bachelorette_party">💃 Bachelorette Party</option>
                  </select>
                  <p className="text-xs text-[#A99985]">
                    Golf and ski trips unlock sport-specific features
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
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
                  <Label htmlFor="end_date">End Date *</Label>
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
                  <Label htmlFor="expected_guests">Expected Guests *</Label>
                  <Input
                    id="expected_guests"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.expected_guests}
                    onChange={(e) => setFormData({ ...formData, expected_guests: e.target.value })}
                    placeholder="e.g., 8"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-[#A99985]">Used to calculate cost per person</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_total">Total Budget (optional)</Label>
                  <Input
                    id="budget_total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budget_total}
                    onChange={(e) => setFormData({ ...formData, budget_total: e.target.value })}
                    placeholder="e.g., 5000"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any details about the trip..."
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-[5px] bg-red-50 p-3 text-sm text-red-800">{error}</div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Trip'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
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
