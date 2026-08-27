import { createServiceClient } from '@/lib/supabase/server'
import { estimateCostUsd } from '@/lib/ai/models'

/**
 * One place to call the model, enforce a cap, and record what it cost.
 *
 * A.3 adds several contextual actions, and every one of them needs the same
 * accounting. Duplicating it per endpoint is how instrumentation quietly rots —
 * a new action gets added, the logging is forgotten, and the cost dashboard is
 * wrong without anyone noticing.
 */

export interface AiCallArgs {
  model: string
  system: string
  prompt: string
  maxTokens: number
  /** Matches ai_usage.action, so cost can be read per feature. */
  action: string
  userId: string
  tripId?: string | null
}

export interface AiCallResult {
  ok: boolean
  text?: string
  /** A sentence safe to show the user. Never a raw provider error. */
  error?: string
  status?: number
}

/**
 * B.4: a trip is the natural unit for a cap, since a trip is what a group shares.
 * A per-account cap would punish the organiser for running the trip.
 */
export async function isOverCap(
  tripId: string | null,
  userId: string,
  action: string,
  limit: number
): Promise<boolean> {
  try {
    const service = createServiceClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    let query = service
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('action', action)
      .gte('created_at', since)

    query = tripId ? query.eq('trip_id', tripId) : query.eq('user_id', userId)

    const { count } = await query
    return (count ?? 0) >= limit
  } catch {
    // If the cap cannot be read, let the call through. Failing closed would break a
    // working feature to protect a budget line, which is the wrong trade at this size.
    return false
  }
}

export async function callModel(args: AiCallArgs): Promise<AiCallResult> {
  const started = Date.now()
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: 'That feature is unavailable right now.',
    }
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: args.model,
        max_tokens: args.maxTokens,
        system: args.system,
        messages: [{ role: 'user', content: args.prompt }],
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      await log(args, 0, 0, Date.now() - started, false, detail.slice(0, 500))
      return { ok: false, status: 502, error: 'That did not work — try again in a moment.' }
    }

    const json = await res.json()
    const inputTokens = json?.usage?.input_tokens ?? 0
    const outputTokens = json?.usage?.output_tokens ?? 0
    const text: string = json?.content?.[0]?.text ?? ''

    await log(args, inputTokens, outputTokens, Date.now() - started, true)
    return { ok: true, text }
  } catch (err: any) {
    await log(args, 0, 0, Date.now() - started, false, String(err?.message ?? err).slice(0, 500))
    return { ok: false, status: 500, error: 'That did not work — try again in a moment.' }
  }
}

/** Strip a stray code fence before parsing. The prompts forbid them; models add them anyway. */
export function parseJsonLoose(text: string): unknown | null {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

async function log(
  args: AiCallArgs,
  input: number,
  output: number,
  latency: number,
  ok: boolean,
  error?: string
) {
  try {
    const service = createServiceClient()
    await service.from('ai_usage').insert({
      user_id: args.userId,
      trip_id: args.tripId ?? null,
      action: args.action,
      model: args.model,
      input_tokens: input,
      output_tokens: output,
      estimated_cost_usd: estimateCostUsd(args.model, input, output),
      latency_ms: latency,
      ok,
      error: error ?? null,
    })
  } catch {
    // Accounting must never break the feature the user is actually using.
  }
}
