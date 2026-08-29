'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'

/**
 * Your crew — Workstream C.1 from the organiser's side.
 *
 * The word "CRM" appears nowhere. Users hear it and think work; this is the people they
 * play golf with. Everything the brief lists as CRM value — preferences carried over,
 * how they pay, notes — is framed as remembering things so nobody has to ask again.
 */

interface Golfer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  handicap_index: number | null
  home_course: string | null
  city: string | null
  pays_via: string | null
  notes: string | null
  linked_user_id: string | null
  trip_count: number
}

const EMPTY = {
  full_name: '',
  email: '',
  phone: '',
  handicap_index: '',
  home_course: '',
  city: '',
  pays_via: '',
  notes: '',
}

export default function CrewPage() {
  const [golfers, setGolfers] = useState<Golfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  // C.2 — history is loaded on demand rather than for every row, so the crew list
  // stays one request no matter how big the roster gets.
  const [openHistory, setOpenHistory] = useState<string | null>(null)
  const [history, setHistory] = useState<Record<string, any>>({})

  const toggleHistory = async (id: string) => {
    if (openHistory === id) {
      setOpenHistory(null)
      return
    }
    setOpenHistory(id)
    if (history[id]) return
    try {
      const res = await fetch(`/api/golfers/${id}/history`)
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not load history'))
      const data = await res.json()
      setHistory((prev) => ({ ...prev, [id]: data }))
    } catch (err: any) {
      toast.error(err.message)
      setOpenHistory(null)
    }
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/golfers')
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not load your crew'))
      const data = await res.json()
      setGolfers(data.golfers || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openEdit = (g: Golfer) => {
    setForm({
      full_name: g.full_name,
      email: g.email ?? '',
      phone: g.phone ?? '',
      handicap_index: g.handicap_index != null ? String(g.handicap_index) : '',
      home_course: g.home_course ?? '',
      city: g.city ?? '',
      pays_via: g.pays_via ?? '',
      notes: g.notes ?? '',
    })
    setEditingId(g.id)
    setFormOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) return
    setSaving(true)
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        // Empty means "not known", which is different from zero — a scratch golfer.
        handicap_index: form.handicap_index === '' ? null : Number(form.handicap_index),
        home_course: form.home_course.trim() || null,
        city: form.city.trim() || null,
        pays_via: form.pays_via.trim() || null,
        notes: form.notes.trim() || null,
      }
      const res = await fetch(editingId ? `/api/golfers/${editingId}` : '/api/golfers', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not save'))
      toast.success(editingId ? 'Updated' : `${payload.full_name} added to your crew`)
      setForm(EMPTY)
      setEditingId(null)
      setFormOpen(false)
      await load()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (g: Golfer) => {
    if (!confirm(`Remove ${g.full_name} from your crew? Trips they were on stay as they are.`)) return
    try {
      const res = await fetch(`/api/golfers/${g.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not remove'))
      setGolfers((prev) => prev.filter((x) => x.id !== g.id))
      toast.success('Removed from your crew')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const field = (key: keyof typeof EMPTY, label: string, props: any = {}) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#1C1A17]">{label}</label>
      <input
        {...props}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-3 text-base text-[#1C1A17] placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl page-title tracking-tight text-[#1C1A17]">Your crew</h1>
            <p className="mt-1 text-[#6B6460]">
              Everyone you golf with, so the next trip doesn&rsquo;t start from a blank form.
            </p>
          </div>
          {!formOpen && (
            <button
              onClick={() => {
                setForm(EMPTY)
                setEditingId(null)
                setFormOpen(true)
              }}
              className="min-h-11 rounded-[5px] bg-[#1C1A17] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Add someone
            </button>
          )}
        </div>

        {formOpen && (
          <form
            onSubmit={save}
            className="mb-6 space-y-3 rounded-[5px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            {field('full_name', 'Name*', { required: true, placeholder: 'Marcus Thompson' })}
            <div className="grid gap-3 sm:grid-cols-2">
              {field('email', 'Email', { type: 'email', placeholder: 'For invites' })}
              {field('phone', 'Phone', { placeholder: 'For the group text' })}
              {field('handicap_index', 'Handicap', { type: 'number', step: '0.1', placeholder: 'e.g. 12.4' })}
              {field('pays_via', 'Pays via', { placeholder: 'venmo @marcus' })}
              {field('home_course', 'Home course')}
              {field('city', 'City')}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#1C1A17]">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Walks, hates early tee times, always pays late…"
                className="w-full rounded-[5px] border border-[#CEC5B0] bg-white p-3 text-base text-[#1C1A17] placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-[5px] bg-[#1C1A17] px-5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add to crew'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false)
                  setEditingId(null)
                }}
                className="min-h-11 rounded-[5px] border border-[#DAD2BC] bg-white px-5 text-sm text-[#1C1A17]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && <p className="text-[#6B6460]">Loading…</p>}
        {error && (
          <div className="rounded-[5px] bg-[#FEF2F2] p-4 text-sm text-[#8B4444]">{error}</div>
        )}

        {!loading && !error && golfers.length === 0 && !formOpen && (
          <div className="rounded-[5px] border-2 border-dashed border-[#DAD2BC] p-12 text-center">
            <h2 className="text-base font-semibold text-[#1C1A17]">No one here yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B6460]">
              Anyone you take on a trip lands here automatically. Add them yourself to
              keep handicaps, how they pay, and what they&rsquo;ll moan about.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {golfers.map((g) => (
            <div
              key={g.id}
              className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[#1C1A17]">
                    {g.full_name}
                    {g.handicap_index != null && (
                      <span className="ml-2 text-sm font-normal text-[#6B6460]">
                        {g.handicap_index} hcp
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[#6B6460]">
                    {[g.email, g.phone, g.city].filter(Boolean).join(' · ') || 'No contact details yet'}
                  </p>
                  {(g.home_course || g.pays_via) && (
                    <p className="mt-1 text-xs text-[#6B6460]">
                      {[g.home_course, g.pays_via && `Pays via ${g.pays_via}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                  {g.notes && <p className="mt-1 text-xs text-[#6B6460]">{g.notes}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm text-[#1C1A17]">
                    {g.trip_count} {g.trip_count === 1 ? 'trip' : 'trips'}
                  </p>
                  <div className="mt-1 flex justify-end gap-3">
                    <button
                      onClick={() => toggleHistory(g.id)}
                      className="text-xs text-[#3B6D11] underline-offset-2 hover:underline"
                    >
                      {openHistory === g.id ? 'Hide' : 'History'}
                    </button>
                    <button
                      onClick={() => openEdit(g)}
                      className="text-xs text-[#3B6D11] underline-offset-2 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(g)}
                      className="text-xs text-[#8B4444] underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {openHistory === g.id && history[g.id] && (
                <div className="mt-3 border-t border-[#F5F1ED] pt-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {[
                      ['Trips together', history[g.id].stats.trip_count],
                      ['Rounds logged', history[g.id].stats.rounds_logged],
                      [
                        'Starter Index',
                        history[g.id].stats.starter_index ?? '—',
                      ],
                      [
                        'Days to join',
                        history[g.id].stats.avg_days_to_join ?? '—',
                      ],
                    ].map(([label, value]) => (
                      <div key={String(label)}>
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B6460]">
                          {label}
                        </p>
                        <p
                          style={{ fontFamily: 'var(--serif)', fontVariantNumeric: 'tabular-nums' }}
                          className="text-xl text-[#1C1A17]"
                        >
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {history[g.id].stats.self_reported_handicap != null &&
                    history[g.id].stats.starter_index != null &&
                    Math.abs(
                      Number(history[g.id].stats.self_reported_handicap) -
                        Number(history[g.id].stats.starter_index)
                    ) >= 3 && (
                      <p className="mt-2 text-xs text-[#7A5E38]">
                        Says {history[g.id].stats.self_reported_handicap}, plays like{' '}
                        {history[g.id].stats.starter_index}.
                      </p>
                    )}

                  {history[g.id].trips.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {history[g.id].trips.slice(0, 5).map((t: any) => (
                        <li key={t.id} className="text-xs text-[#6B6460]">
                          <span className="text-[#1C1A17]">{t.title}</span>
                          {t.destination ? ` · ${t.destination}` : ''}
                          {t.start_date ? ` · ${t.start_date.slice(0, 4)}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
