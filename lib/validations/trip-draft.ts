import { z } from 'zod'

/**
 * B.2: the model returns JSON against this schema, never prose.
 *
 * Every field is nullable on purpose. A one-sentence prompt will not mention a budget
 * or exact dates, and a model that must produce a value invents one — an invented date
 * on a trip is worse than a blank field the organiser fills in themselves. Null means
 * "not stated", and the form leaves it empty.
 *
 * This is also the review contract: the draft pre-fills the form and the organiser
 * confirms before anything is written, so nothing here is trusted enough to save
 * directly.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Dates must be YYYY-MM-DD')

export const tripDraftSchema = z.object({
  title: z.string().min(1).max(100).nullable(),
  destination: z.string().min(1).max(100).nullable(),
  start_date: isoDate.nullable(),
  end_date: isoDate.nullable(),
  expected_guests: z.number().int().min(1).max(500).nullable(),
  rounds_planned: z.number().int().min(0).max(20).nullable(),
  target_courses: z.array(z.string().min(1).max(120)).max(20),
  default_format: z.enum(['nassau', 'skins', 'wolf', 'stroke_play']).nullable(),
  stakes: z.string().max(120).nullable(),
  /** Total for the group. Per-head figures are multiplied out before this is set. */
  budget_total: z.number().min(0).max(1_000_000).nullable(),
  description: z.string().max(1000).nullable(),
})

export type TripDraft = z.infer<typeof tripDraftSchema>

export const EMPTY_DRAFT: TripDraft = {
  title: null,
  destination: null,
  start_date: null,
  end_date: null,
  expected_guests: null,
  rounds_planned: null,
  target_courses: [],
  default_format: null,
  stakes: null,
  budget_total: null,
  description: null,
}
