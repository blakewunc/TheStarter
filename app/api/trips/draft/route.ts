import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { tripDraftSchema, EMPTY_DRAFT } from '@/lib/validations/trip-draft'
import { MODELS, estimateCostUsd } from '@/lib/ai/models'
import { toDateString } from '@/lib/dates'

/**
 * POST /api/trips/draft — turn a sentence into a reviewable trip draft.
 *
 * B.2: returns JSON validated against tripDraftSchema, never prose. B.4: runs on the
 * small model with a tight token ceiling, because this is extraction against a fixed
 * shape rather than reasoning.
 *
 * Nothing here writes a trip. The draft pre-fills the create form and the organiser
 * confirms it, which is what makes the feature trustworthy rather than magical — and
 * what makes it usable by someone who would never let software book something for them.
 */

const MAX_PROMPT_CHARS = 600
const MAX_OUTPUT_TOKENS = 700

/** B.4: a trip is the natural unit for a cap; a per-account cap punishes the organiser. */
const DAILY_DRAFT_CAP = 15

function buildSystemPrompt(today: string) {
  return `You extract golf trip details from one sentence and return JSON. Nothing else.

Today is ${today}.

Return ONLY a JSON object with exactly these keys:
  title             string | null   short trip name, e.g. "Pinehurst Boys Trip"
  destination       string | null   "City, ST" when a US place is identifiable
  start_date        string | null   YYYY-MM-DD
  end_date          string | null   YYYY-MM-DD
  expected_guests   number | null   how many players
  rounds_planned    number | null   how many rounds
  target_courses    string[]        named courses; [] when none named
  default_format    string | null   one of: nassau, skins, wolf, stroke_play
  stakes            string | null   verbatim, e.g. "$10 per side"
  budget_total      number | null   TOTAL for the group, not per head
  description       string | null   anything else worth keeping, one or two sentences

Rules:
- Use null for anything not stated. Never invent a date, a budget, or a course.
- "4 nights" means end_date is 4 nights after start_date. Only set dates if the
  sentence pins them down; a bare month is not enough.
- A per-head budget must be multiplied by the number of players to give budget_total.
  If players are unknown, leave budget_total null.
- No prose, no markdown, no code fences. JSON only.`
}

export async function POST(request: Request) {
  const started = Date.now()
  let userId: string | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userId = user.id

    const body = await request.json()
    const prompt = String(body?.prompt ?? '').trim()
    if (!prompt) {
      return NextResponse.json({ error: 'Tell us about the trip first.' }, { status: 400 })
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      return NextResponse.json(
        { error: `Keep it under ${MAX_PROMPT_CHARS} characters.` },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // The form still works without AI, so this is a soft failure by design.
      return NextResponse.json(
        { error: 'Drafting is unavailable right now — fill it in manually below.' },
        { status: 503 }
      )
    }

    const service = createServiceClient()

    // B.4 cap. Counted per user per day here, since a draft has no trip yet.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await service
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'trip_draft')
      .gte('created_at', since)

    if ((count ?? 0) >= DAILY_DRAFT_CAP) {
      return NextResponse.json(
        { error: "That's your drafting for today — the manual form is right below." },
        { status: 429 }
      )
    }

    const model = MODELS.draft
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: buildSystemPrompt(toDateString(new Date())),
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      await logUsage(service, {
        userId: user.id,
        model,
        input: 0,
        output: 0,
        latency: Date.now() - started,
        ok: false,
        error: detail.slice(0, 500),
      })
      return NextResponse.json(
        { error: 'Drafting failed — fill it in manually below.' },
        { status: 502 }
      )
    }

    const json = await res.json()
    const inputTokens = json?.usage?.input_tokens ?? 0
    const outputTokens = json?.usage?.output_tokens ?? 0
    const text: string = json?.content?.[0]?.text ?? ''

    // Belt and braces: the prompt forbids fences, but a stray one should not cost the
    // user their draft.
    const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      await logUsage(service, {
        userId: user.id,
        model,
        input: inputTokens,
        output: outputTokens,
        latency: Date.now() - started,
        ok: false,
        error: 'model returned non-JSON',
      })
      return NextResponse.json(
        { error: "Couldn't read that one — try rephrasing, or fill it in below." },
        { status: 422 }
      )
    }

    const validated = tripDraftSchema.safeParse({ ...EMPTY_DRAFT, ...(parsed as object) })
    if (!validated.success) {
      await logUsage(service, {
        userId: user.id,
        model,
        input: inputTokens,
        output: outputTokens,
        latency: Date.now() - started,
        ok: false,
        error: validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ').slice(0, 500),
      })
      return NextResponse.json(
        { error: "Couldn't read that one — try rephrasing, or fill it in below." },
        { status: 422 }
      )
    }

    await logUsage(service, {
      userId: user.id,
      model,
      input: inputTokens,
      output: outputTokens,
      latency: Date.now() - started,
      ok: true,
    })

    return NextResponse.json({ draft: validated.data })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Drafting failed — fill it in manually below.' },
      { status: 500 }
    )
  }
}

async function logUsage(
  service: ReturnType<typeof createServiceClient>,
  args: {
    userId: string | null
    model: string
    input: number
    output: number
    latency: number
    ok: boolean
    error?: string
  }
) {
  try {
    await service.from('ai_usage').insert({
      user_id: args.userId,
      trip_id: null,
      action: 'trip_draft',
      model: args.model,
      input_tokens: args.input,
      output_tokens: args.output,
      estimated_cost_usd: estimateCostUsd(args.model, args.input, args.output),
      latency_ms: args.latency,
      ok: args.ok,
      error: args.error ?? null,
    })
  } catch {
    // Never let accounting break the feature the user is actually using.
  }
}
