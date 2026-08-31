'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/dates'
import { formatCurrency } from '@/lib/utils/currency'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'

interface LinkedBudget {
  id: string
  name: string
  estimated_cost: number
  split_type: string
}

interface Accommodation {
  id: string
  name: string
  address: string | null
  check_in_date: string | null
  check_in_time: string | null
  check_out_date: string | null
  check_out_time: string | null
  door_code: string | null
  wifi_name: string | null
  wifi_password: string | null
  house_rules: string | null
  notes: string | null
  booking_url: string | null
  confirmation_number: string | null
  /** Cost lives on the linked budget category, never on the property itself. */
  budget: LinkedBudget | LinkedBudget[] | null
}

interface LodgingCardProps {
  tripId: string
  isOrganizer: boolean
  /** How many ways costs are split, so the per-person figure matches the Budget tab. */
  splitCount: number
}

const EMPTY_FORM = {
  name: '',
  address: '',
  check_in_date: '',
  check_in_time: '',
  check_out_date: '',
  check_out_time: '',
  cost: '',
  door_code: '',
  wifi_name: '',
  wifi_password: '',
  confirmation_number: '',
  booking_url: '',
  notes: '',
}

/** PostgREST returns an embedded to-one as either an object or a single-element array. */
function linkedBudget(a: Accommodation): LinkedBudget | null {
  if (!a.budget) return null
  return Array.isArray(a.budget) ? a.budget[0] ?? null : a.budget
}

function stayRange(a: Accommodation): string | null {
  if (!a.check_in_date) return null
  const inPart =
    formatDate(a.check_in_date, { month: 'short', day: 'numeric' }) +
    (a.check_in_time ? ` ${formatTime(a.check_in_time)}` : '')
  if (!a.check_out_date) return inPart
  const outPart =
    formatDate(a.check_out_date, { month: 'short', day: 'numeric' }) +
    (a.check_out_time ? ` ${formatTime(a.check_out_time)}` : '')
  return `${inPart} → ${outPart}`
}

export function LodgingCard({ tripId, isOrganizer, splitCount }: LodgingCardProps) {
  const [items, setItems] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/accommodations`)
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Failed to load lodging'))
      const data = await res.json()
      setItems(data.accommodations || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (a: Accommodation) => {
    const budget = linkedBudget(a)
    setForm({
      name: a.name || '',
      address: a.address || '',
      check_in_date: a.check_in_date || '',
      check_in_time: a.check_in_time?.slice(0, 5) || '',
      check_out_date: a.check_out_date || '',
      check_out_time: a.check_out_time?.slice(0, 5) || '',
      cost: budget ? String(budget.estimated_cost) : '',
      door_code: a.door_code || '',
      wifi_name: a.wifi_name || '',
      wifi_password: a.wifi_password || '',
      confirmation_number: a.confirmation_number || '',
      booking_url: a.booking_url || '',
      notes: a.notes || '',
    })
    setEditingId(a.id)
    setFormOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const url = editingId
        ? `/api/trips/${tripId}/accommodations/${editingId}`
        : `/api/trips/${tripId}/accommodations`
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cost: form.cost === '' ? null : form.cost }),
      })
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Failed to save lodging'))
      const data = await res.json()
      // The property can save while its budget line fails; surface that rather than
      // reporting a clean success.
      if (data.warning) toast.warning(data.warning)
      else toast.success(editingId ? 'Lodging updated' : 'Lodging added')
      setFormOpen(false)
      setEditingId(null)
      await load()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (a: Accommodation) => {
    if (!confirm(`Remove ${a.name}? Any budget line for it stays, just unlinked.`)) return
    try {
      const res = await fetch(`/api/trips/${tripId}/accommodations/${a.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Failed to remove lodging'))
      toast.success('Lodging removed')
      await load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const field = (key: keyof typeof EMPTY_FORM, label: string, props: any = {}) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#1C1A17]">{label}</label>
      <input
        {...props}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full rounded-[5px] border border-[#DAD2BC] bg-white px-2.5 py-1.5 text-sm text-[#1C1A17] placeholder-[#6B6460] outline-none focus:border-[#3B6D11]"
      />
    </div>
  )

  return (
    <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1C1A17]">Where you&apos;re staying</h3>
        {isOrganizer && !formOpen && (
          <button
            onClick={openAdd}
            className="rounded-[5px] border border-[#DAD2BC] px-3 py-1.5 text-xs font-medium text-[#1C1A17] transition-colors hover:bg-[#F5F1ED]"
          >
            {items.length > 0 ? 'Add another' : 'Add lodging'}
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-[#6B6460]">Loading…</p>}

      {error && (
        <div className="rounded-[5px] bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      {!loading && !error && items.length === 0 && !formOpen && (
        <p className="text-sm text-[#6B6460]">
          No lodging yet. Add the rental and its cost lands in the budget automatically.
        </p>
      )}

      <div className="space-y-3">
        {items.map((a) => {
          const budget = linkedBudget(a)
          const range = stayRange(a)
          return (
            <div key={a.id} className="rounded-[5px] border border-[#DAD2BC] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[#1C1A17]">{a.name}</p>
                  {a.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(a.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#3B6D11] underline-offset-2 hover:underline"
                    >
                      {a.address}
                    </a>
                  )}
                  {range && <p className="mt-1 text-sm text-[#6B6460]">{range}</p>}
                </div>
                {budget ? (
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-[#1C1A17]">
                      {formatCurrency(budget.estimated_cost)}
                    </p>
                    {budget.split_type === 'equal' && splitCount > 0 && (
                      <p className="text-xs text-[#6B6460]">
                        {formatCurrency(budget.estimated_cost / splitCount)} each,{' '}
                        {splitCount} {splitCount === 1 ? 'way' : 'ways'}
                      </p>
                    )}
                  </div>
                ) : (
                  /* A property whose budget line was created separately — or before the
                     link existed — has no linked category, and the card used to render a
                     blank space where the cost goes. Silent absence reads as "this rental
                     is free", which is the same failure as a trips list that renders an
                     error as an empty account. Say which state this is. */
                  <p className="shrink-0 text-right text-xs text-[#6B6460]">
                    No cost linked
                    {isOrganizer && (
                      <>
                        <br />
                        <span className="text-[#3B6D11]">Edit to add one</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {(a.door_code || a.wifi_name || a.confirmation_number || a.booking_url) && (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-[#DAD2BC] pt-3 text-xs text-[#6B6460]">
                  {a.door_code && (
                    <span>
                      Door <span className="font-medium text-[#1C1A17]">{a.door_code}</span>
                    </span>
                  )}
                  {a.wifi_name && (
                    <span>
                      Wifi <span className="font-medium text-[#1C1A17]">{a.wifi_name}</span>
                      {a.wifi_password ? ` / ${a.wifi_password}` : ''}
                    </span>
                  )}
                  {a.confirmation_number && (
                    <span>
                      Conf{' '}
                      <span className="font-medium text-[#1C1A17]">
                        {a.confirmation_number}
                      </span>
                    </span>
                  )}
                  {a.booking_url && (
                    <a
                      href={a.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3B6D11] underline-offset-2 hover:underline"
                    >
                      Booking
                    </a>
                  )}
                </div>
              )}

              {a.notes && <p className="mt-2 text-xs text-[#6B6460]">{a.notes}</p>}

              {isOrganizer && (
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => openEdit(a)}
                    className="text-xs text-[#3B6D11] underline-offset-2 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(a)}
                    className="text-xs text-[#8B4444] underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {formOpen && (
        <form onSubmit={save} className="mt-4 space-y-3 border-t border-[#DAD2BC] pt-4">
          {field('name', 'Property name*', { required: true, placeholder: 'VRBO on Midland' })}
          {field('address', 'Address', { placeholder: '101 Midland Rd, Southern Pines, NC' })}

          <div className="grid grid-cols-2 gap-3">
            {field('check_in_date', 'Check-in', { type: 'date' })}
            {field('check_in_time', 'Time', { type: 'time' })}
            {field('check_out_date', 'Check-out', { type: 'date' })}
            {field('check_out_time', 'Time', { type: 'time' })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('cost', 'Total cost', {
              type: 'number',
              min: '0',
              step: '0.01',
              placeholder: '1480',
            })}
            {field('door_code', 'Door code', { placeholder: '8410' })}
          </div>
          <p className="text-xs text-[#6B6460]">
            Entering a cost creates a linked lodging line in the budget. Edit it here or
            there — it&apos;s the same figure.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {field('wifi_name', 'Wifi network')}
            {field('wifi_password', 'Wifi password')}
            {field('confirmation_number', 'Confirmation #')}
            {field('booking_url', 'Booking link', { placeholder: 'https://…' })}
          </div>

          {field('notes', 'Notes', { placeholder: 'Parking, quiet hours, etc.' })}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[5px] bg-[#3B6D11] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add lodging'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false)
                setEditingId(null)
              }}
              disabled={saving}
              className="rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm text-[#1C1A17] transition-colors hover:bg-[#F5F1ED]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
