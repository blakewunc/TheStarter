'use client'

import { PuttingCountdown } from '@/components/trips/PuttingCountdown'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type DocumentCategory = 'accommodation' | 'reservation' | 'activity' | 'flight' | 'other'
type TransportType = 'carpool' | 'flight' | 'train' | 'other'

interface TripDocument {
  id: string
  title: string
  url: string
  description: string | null
  category: DocumentCategory
  created_by: string
  created_by_profile?: {
    display_name: string | null
    email: string
  }
}

interface TransportEntry {
  id: string
  type: TransportType
  departure_time: string | null
  departure_location: string | null
  arrival_time: string | null
  arrival_location: string | null
  seats_available: number | null
  notes: string | null
  created_by: string
  profiles?: {
    display_name: string | null
    email: string
  }
}

interface AccommodationTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

const transportTypeLabels: Record<TransportType, string> = {
  carpool: '🚗 Carpool',
  flight: '✈️ Flight',
  train: '🚂 Train',
  other: '🚌 Other',
}

export function AccommodationTab({ tripId, trip, currentUserId, isOrganizer }: AccommodationTabProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accommodation, setAccommodation] = useState<any>(null)
  const [documents, setDocuments] = useState<TripDocument[]>([])
  const [transportation, setTransportation] = useState<TransportEntry[]>([])
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    check_in: '',
    check_out: '',
    door_code: '',
    wifi_name: '',
    wifi_password: '',
    house_rules: '',
    notes: '',
  })
  const [newDoc, setNewDoc] = useState({
    title: '',
    url: '',
    description: '',
    category: 'other' as DocumentCategory
  })
  const [showDocForm, setShowDocForm] = useState(false)
  const [showTransportForm, setShowTransportForm] = useState(false)
  const [newTransport, setNewTransport] = useState({
    type: 'carpool' as TransportType,
    departure_time: '',
    departure_location: '',
    arrival_time: '',
    arrival_location: '',
    seats_available: '',
    notes: '',
  })
  const [addingTransport, setAddingTransport] = useState(false)

  useEffect(() => {
    if (tripId) fetchData()
  }, [tripId])

  async function fetchData() {
    setLoading(true)
    try {
      const [accRes, docsRes, transRes] = await Promise.all([
        fetch(`/api/trips/${tripId}/accommodation`),
        fetch(`/api/trips/${tripId}/documents`),
        fetch(`/api/trips/${tripId}/transportation`),
      ])

      if (accRes.ok) {
        const accData = await accRes.json()
        if (accData.accommodation) {
          setAccommodation(accData.accommodation)
          setFormData({
            name: accData.accommodation.name || '',
            address: accData.accommodation.address || '',
            check_in: accData.accommodation.check_in ? accData.accommodation.check_in.slice(0, 16) : '',
            check_out: accData.accommodation.check_out ? accData.accommodation.check_out.slice(0, 16) : '',
            door_code: accData.accommodation.door_code || '',
            wifi_name: accData.accommodation.wifi_name || '',
            wifi_password: accData.accommodation.wifi_password || '',
            house_rules: accData.accommodation.house_rules || '',
            notes: accData.accommodation.notes || '',
          })
        }
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDocuments(docsData.documents || [])
      }

      if (transRes.ok) {
        const transData = await transRes.json()
        setTransportation(transData.transportation || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAccommodation(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/accommodation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to save accommodation')

      const data = await response.json()
      setAccommodation(data.accommodation)
      toast.success('Accommodation details saved!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddDocument(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const response = await fetch(`/api/trips/${tripId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      })

      if (!response.ok) throw new Error('Failed to add document')

      setNewDoc({ title: '', url: '', description: '', category: 'other' })
      setShowDocForm(false)
      fetchData()
      toast.success('Link added!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm('Delete this link?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/documents/${docId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete document')
      fetchData()
      toast.success('Link removed')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function handleAddTransport(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddingTransport(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/transportation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransport),
      })

      if (!response.ok) throw new Error('Failed to add transportation')

      setNewTransport({
        type: 'carpool',
        departure_time: '',
        departure_location: '',
        arrival_time: '',
        arrival_location: '',
        seats_available: '',
        notes: '',
      })
      setShowTransportForm(false)
      fetchData()
      toast.success('Transportation added!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setAddingTransport(false)
    }
  }

  async function handleDeleteTransport(transportId: string) {
    if (!confirm('Remove this transportation entry?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/transportation/${transportId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      fetchData()
      toast.success('Entry removed')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const formatDateTime = (dt: string | null) => {
    if (!dt) return null
    return new Date(dt).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  }

  const categoryLabels: Record<DocumentCategory, string> = {
    accommodation: '🏠 Accommodation',
    reservation: '🍽️ Reservation',
    activity: '⛳ Activity',
    flight: '✈️ Flight',
    other: '📄 Other'
  }

  if (loading) {
    return <p className="text-[#A99985]">Loading...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#252323]">Accommodation & Logistics</h2>
        <p className="text-[#A99985]">Manage where you&apos;re staying and how everyone&apos;s getting there</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Accommodation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Accommodation Details</CardTitle>
              <CardDescription>
                {isOrganizer ? 'Add details about where the group is staying' : 'View accommodation information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOrganizer ? (
                <form onSubmit={handleSaveAccommodation} className="space-y-4">
                  <div>
                    <Label htmlFor="acc_name">Property Name</Label>
                    <Input
                      id="acc_name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Airbnb, Hotel name, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="acc_address">Address</Label>
                    <Input
                      id="acc_address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City, State"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="acc_check_in">Check-in</Label>
                      <Input
                        id="acc_check_in"
                        type="datetime-local"
                        value={formData.check_in}
                        onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="acc_check_out">Check-out</Label>
                      <Input
                        id="acc_check_out"
                        type="datetime-local"
                        value={formData.check_out}
                        onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="acc_door_code">Door Code</Label>
                      <Input
                        id="acc_door_code"
                        value={formData.door_code}
                        onChange={(e) => setFormData({ ...formData, door_code: e.target.value })}
                        placeholder="1234"
                      />
                    </div>
                    <div>
                      <Label htmlFor="acc_wifi_name">WiFi Network</Label>
                      <Input
                        id="acc_wifi_name"
                        value={formData.wifi_name}
                        onChange={(e) => setFormData({ ...formData, wifi_name: e.target.value })}
                        placeholder="Network name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="acc_wifi_password">WiFi Password</Label>
                    <Input
                      id="acc_wifi_password"
                      value={formData.wifi_password}
                      onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })}
                      placeholder="Password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="acc_house_rules">House Rules</Label>
                    <Input
                      id="acc_house_rules"
                      value={formData.house_rules}
                      onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })}
                      placeholder="No smoking, quiet hours 10pm-8am, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="acc_notes">Additional Notes</Label>
                    <Input
                      id="acc_notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Parking info, nearby amenities, etc."
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? 'Saving...' : 'Save Details'}
                  </Button>
                </form>
              ) : accommodation ? (
                <div className="space-y-4 text-sm">
                  {accommodation.name && (
                    <div>
                      <p className="font-semibold text-[#252323]">Property</p>
                      <p className="text-[#A99985]">{accommodation.name}</p>
                    </div>
                  )}
                  {accommodation.address && (
                    <div>
                      <p className="font-semibold text-[#252323]">Address</p>
                      <p className="text-[#A99985]">{accommodation.address}</p>
                    </div>
                  )}
                  {(accommodation.check_in || accommodation.check_out) && (
                    <div>
                      <p className="font-semibold text-[#252323]">Check-in / Check-out</p>
                      <p className="text-[#A99985]">
                        {accommodation.check_in && new Date(accommodation.check_in).toLocaleString()}
                        {' → '}
                        {accommodation.check_out && new Date(accommodation.check_out).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {accommodation.door_code && (
                    <div>
                      <p className="font-semibold text-[#252323]">Door Code</p>
                      <p className="font-mono text-lg text-[#252323]">{accommodation.door_code}</p>
                    </div>
                  )}
                  {accommodation.wifi_name && (
                    <div>
                      <p className="font-semibold text-[#252323]">WiFi</p>
                      <p className="text-[#A99985]">Network: {accommodation.wifi_name}</p>
                      {accommodation.wifi_password && (
                        <p className="font-mono text-[#252323]">Password: {accommodation.wifi_password}</p>
                      )}
                    </div>
                  )}
                  {accommodation.house_rules && (
                    <div>
                      <p className="font-semibold text-[#252323]">House Rules</p>
                      <p className="text-[#A99985]">{accommodation.house_rules}</p>
                    </div>
                  )}
                  {accommodation.notes && (
                    <div>
                      <p className="font-semibold text-[#252323]">Notes</p>
                      <p className="text-[#A99985]">{accommodation.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#A99985]">
                  No accommodation details yet. The organizer can add them.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Transportation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transportation</CardTitle>
                  <CardDescription>Carpools, flights, and how everyone&apos;s getting there</CardDescription>
                </div>
                {!showTransportForm && (
                  <Button size="sm" onClick={() => setShowTransportForm(true)}>
                    + Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showTransportForm && (
                <form onSubmit={handleAddTransport} className="mb-6 space-y-3 rounded-[8px] border border-[#DAD2BC] bg-[#F5F1ED] p-4">
                  <div>
                    <Label htmlFor="trans_type">Type</Label>
                    <select
                      id="trans_type"
                      value={newTransport.type}
                      onChange={(e) => setNewTransport({ ...newTransport, type: e.target.value as TransportType })}
                      className="flex h-10 w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm"
                    >
                      <option value="carpool">🚗 Carpool</option>
                      <option value="flight">✈️ Flight</option>
                      <option value="train">🚂 Train</option>
                      <option value="other">🚌 Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="trans_dep_loc">Departing from</Label>
                      <Input
                        id="trans_dep_loc"
                        value={newTransport.departure_location}
                        onChange={(e) => setNewTransport({ ...newTransport, departure_location: e.target.value })}
                        placeholder="Airport, city, address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trans_dep_time">Departure time</Label>
                      <Input
                        id="trans_dep_time"
                        type="datetime-local"
                        value={newTransport.departure_time}
                        onChange={(e) => setNewTransport({ ...newTransport, departure_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="trans_arr_loc">Arriving at</Label>
                      <Input
                        id="trans_arr_loc"
                        value={newTransport.arrival_location}
                        onChange={(e) => setNewTransport({ ...newTransport, arrival_location: e.target.value })}
                        placeholder="Airport, city, address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trans_arr_time">Arrival time</Label>
                      <Input
                        id="trans_arr_time"
                        type="datetime-local"
                        value={newTransport.arrival_time}
                        onChange={(e) => setNewTransport({ ...newTransport, arrival_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="trans_seats">Seats available</Label>
                      <Input
                        id="trans_seats"
                        type="number"
                        min="0"
                        value={newTransport.seats_available}
                        onChange={(e) => setNewTransport({ ...newTransport, seats_available: e.target.value })}
                        placeholder="e.g. 3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trans_notes">Notes</Label>
                      <Input
                        id="trans_notes"
                        value={newTransport.notes}
                        onChange={(e) => setNewTransport({ ...newTransport, notes: e.target.value })}
                        placeholder="Flight number, rental co., etc."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={addingTransport}>
                      {addingTransport ? 'Adding...' : 'Add Entry'}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowTransportForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {transportation.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#A99985]">
                  No transportation added yet. Add flights, carpools, or other details.
                </p>
              ) : (
                <div className="space-y-3">
                  {transportation.map((entry) => (
                    <div key={entry.id} className="rounded-[5px] border border-[#DAD2BC] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#252323]">{transportTypeLabels[entry.type]}</p>
                          {(entry.departure_location || entry.arrival_location) && (
                            <p className="mt-0.5 text-xs text-[#A99985]">
                              {entry.departure_location && <span>{entry.departure_location}</span>}
                              {entry.departure_location && entry.arrival_location && <span> → </span>}
                              {entry.arrival_location && <span>{entry.arrival_location}</span>}
                            </p>
                          )}
                          {entry.departure_time && (
                            <p className="mt-0.5 text-xs text-[#A99985]">
                              Departs: {formatDateTime(entry.departure_time)}
                              {entry.arrival_time && ` · Arrives: ${formatDateTime(entry.arrival_time)}`}
                            </p>
                          )}
                          {entry.seats_available != null && (
                            <p className="mt-0.5 text-xs text-[#A99985]">{entry.seats_available} seat{entry.seats_available !== 1 ? 's' : ''} available</p>
                          )}
                          {entry.notes && (
                            <p className="mt-0.5 text-xs text-[#70798C]">{entry.notes}</p>
                          )}
                          <p className="mt-1 text-xs text-[#DAD2BC]">
                            Added by {(entry.profiles as any)?.display_name || (entry.profiles as any)?.email || 'someone'}
                          </p>
                        </div>
                        {(entry.created_by === currentUserId || isOrganizer) && (
                          <button
                            onClick={() => handleDeleteTransport(entry.id)}
                            className="shrink-0 text-xs text-[#A99985] transition-colors hover:text-[#8B4444]"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Documents & Links */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents & Links</CardTitle>
                  <CardDescription>Shared links for reservations, listings, etc.</CardDescription>
                </div>
                {!showDocForm && (
                  <Button size="sm" onClick={() => setShowDocForm(true)}>
                    + Add Link
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showDocForm && (
                <form onSubmit={handleAddDocument} className="mb-6 space-y-3 rounded-[8px] border border-[#DAD2BC] bg-[#F5F1ED] p-4">
                  <div>
                    <Label htmlFor="doc_title">Title *</Label>
                    <Input
                      id="doc_title"
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                      placeholder="Airbnb Listing, Tee Time Confirmation, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc_url">URL *</Label>
                    <Input
                      id="doc_url"
                      type="url"
                      value={newDoc.url}
                      onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc_category">Category</Label>
                    <select
                      id="doc_category"
                      value={newDoc.category}
                      onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DocumentCategory })}
                      className="flex h-10 w-full rounded-[5px] border border-[#DAD2BC] bg-white px-3 py-2 text-sm"
                    >
                      <option value="accommodation">Accommodation</option>
                      <option value="reservation">Reservation</option>
                      <option value="activity">Activity</option>
                      <option value="flight">Flight</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Add Link</Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowDocForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {documents.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#A99985]">
                  No links added yet. Add important URLs like Airbnb listings, tee times, flight confirmations, etc.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between rounded-[5px] border border-[#DAD2BC] p-3"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-[#A99985]">{categoryLabels[doc.category]}</p>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#70798C] hover:underline"
                        >
                          {doc.title}
                        </a>
                        {doc.description && (
                          <p className="mt-1 text-xs text-[#A99985]">{doc.description}</p>
                        )}
                        <p className="mt-1 text-xs text-[#A99985]">
                          Added by {doc.created_by_profile?.display_name || doc.created_by_profile?.email}
                        </p>
                      </div>
                      {doc.created_by === currentUserId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
