'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CoursePicker, type Course } from '@/components/golf/CoursePicker'
import { fetchErrorMessage } from '@/lib/hooks/fetchError'
import { toDateString } from '@/lib/dates'

/**
 * Log a round. D.1.
 *
 * "Posting a round must be the fastest thing in the app." So: course, date, score, done
 * — three fields, all pre-filled where possible, and the date defaults to today because
 * people post on the drive home.
 *
 * Tee set is asked for only when the course has tee data on file, and entering that data
 * is offered rather than required. A round at a course nobody has rated still counts as
 * a round played; it just cannot enter a cross-course standing yet. Blocking the post
 * until someone types a slope would mean most rounds never get logged, and the whole of
 * Workstream D rests on rounds getting logged.
 */

interface Tee {
  id: string
  tee_set: string
  course_rating: number
  slope: number
  par: number
}

export function LogRoundDialog({ onLogged }: { onLogged?: () => void }) {
  const [open, setOpen] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [course, setCourse] = useState<Course | null>(null)
  const [tees, setTees] = useState<Tee[]>([])
  const [teeId, setTeeId] = useState('')
  const [playedOn, setPlayedOn] = useState(toDateString(new Date()))
  const [score, setScore] = useState('')
  const [saving, setSaving] = useState(false)

  // Adding tee data, only when someone chooses to
  const [addingTees, setAddingTees] = useState(false)
  const [teeForm, setTeeForm] = useState({ tee_set: '', course_rating: '', slope: '', par: '72' })

  const pickCourse = async (c: Course | null) => {
    setCourse(c)
    setTeeId('')
    setTees([])
    if (!c) return
    try {
      const res = await fetch(`/api/courses/${c.id}/tees`)
      if (res.ok) {
        const data = await res.json()
        setTees(data.tees || [])
        if (data.tees?.length === 1) setTeeId(data.tees[0].id)
      }
    } catch {
      // Tee data is an enhancement; failing to load it must not block the round.
    }
  }

  const saveTees = async () => {
    if (!course) return
    try {
      const res = await fetch(`/api/courses/${course.id}/tees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tee_set: teeForm.tee_set.trim(),
          course_rating: Number(teeForm.course_rating),
          slope: Number(teeForm.slope),
          par: Number(teeForm.par),
        }),
      })
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not save those tees'))
      const { tee } = await res.json()
      setTees((prev) => [...prev, tee])
      setTeeId(tee.id)
      setAddingTees(false)
      toast.success(`${tee.tee_set} saved — everyone gets these now`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseName.trim() || !score) return
    setSaving(true)
    try {
      const res = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_name: courseName.trim(),
          course_id: course?.id ?? null,
          tee_id: teeId || null,
          played_on: playedOn,
          gross_score: Number(score),
        }),
      })
      if (!res.ok) throw new Error(await fetchErrorMessage(res, 'Could not log that round'))
      const { round } = await res.json()
      toast.success(
        round.differential != null
          ? `Logged — ${round.differential} differential`
          : 'Round logged'
      )
      setCourseName('')
      setCourse(null)
      setTees([])
      setTeeId('')
      setScore('')
      setOpen(false)
      onLogged?.()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-[5px] bg-[#1C1A17] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Log a round
      </button>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-[5px] border border-[#DAD2BC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-[#1C1A17]">Course</label>
        <CoursePicker
          value={courseName}
          onChange={setCourseName}
          onSelectCourse={pickCourse}
          required
          disabled={saving}
        />
      </div>

      {course && tees.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-[#1C1A17]">Tees</label>
          <div className="flex flex-wrap gap-2">
            {tees.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTeeId(teeId === t.id ? '' : t.id)}
                className={`min-h-11 rounded-[5px] border px-3 text-sm transition-colors ${
                  teeId === t.id
                    ? 'border-[#3B6D11] bg-[#3B6D11] text-white'
                    : 'border-[#DAD2BC] bg-white text-[#1C1A17] hover:bg-[#F5F1ED]'
                }`}
              >
                {t.tee_set}
                <span className="ml-1.5 text-xs opacity-70">
                  {t.course_rating}/{t.slope}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {course && tees.length === 0 && !addingTees && (
        <p className="text-xs text-[#6B6460]">
          Nobody&rsquo;s added tees for this course yet.{' '}
          <button
            type="button"
            onClick={() => setAddingTees(true)}
            className="font-medium text-[#3B6D11] underline-offset-2 hover:underline"
          >
            Add them
          </button>{' '}
          — twenty seconds off the scorecard, and every round here becomes comparable.
          Your round saves either way.
        </p>
      )}

      {addingTees && course && (
        <div className="space-y-2 rounded-[5px] border border-[#DAD2BC] bg-[#F5F1ED] p-3">
          <p className="text-xs text-[#6B6460]">
            Off the back of the scorecard, for the tees you played.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              ['tee_set', 'Tees', 'Blue', 'text'],
              ['course_rating', 'Rating', '72.4', 'number'],
              ['slope', 'Slope', '131', 'number'],
              ['par', 'Par', '72', 'number'],
            ] as const).map(([key, label, ph, type]) => (
              <div key={key}>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#6B6460]">
                  {label}
                </label>
                <input
                  type={type}
                  step={key === 'course_rating' ? '0.1' : undefined}
                  placeholder={ph}
                  value={teeForm[key]}
                  onChange={(e) => setTeeForm({ ...teeForm, [key]: e.target.value })}
                  className="h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-2 text-base text-[#1C1A17]"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveTees}
              className="min-h-11 rounded-[5px] bg-[#1C1A17] px-4 text-sm font-medium text-white"
            >
              Save tees
            </button>
            <button
              type="button"
              onClick={() => setAddingTees(false)}
              className="min-h-11 rounded-[5px] border border-[#DAD2BC] bg-white px-4 text-sm text-[#1C1A17]"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#1C1A17]">Date</label>
          <input
            type="date"
            value={playedOn}
            onChange={(e) => setPlayedOn(e.target.value)}
            required
            className="h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-3 text-base text-[#1C1A17]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#1C1A17]">Score</label>
          <input
            type="number"
            inputMode="numeric"
            min="18"
            max="200"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="86"
            required
            className="h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-3 text-base text-[#1C1A17]"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || !courseName.trim() || !score}
          className="min-h-11 rounded-[5px] bg-[#1C1A17] px-5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Log it'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 rounded-[5px] border border-[#DAD2BC] bg-white px-5 text-sm text-[#1C1A17]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
