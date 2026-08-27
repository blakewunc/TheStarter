/**
 * Model selection and cost accounting.
 *
 * B.4: cheapest capable model by default, escalating only where the task genuinely
 * needs it. Everything previously ran on one mid-tier model, including work that is
 * really structured extraction from a single sentence.
 */

export const MODELS = {
  /**
   * Turning "8 guys, Pinehurst, 4 nights, 3 rounds, Nassau, ~$600/head" into fields.
   * This is extraction against a fixed schema, not reasoning — the small model is the
   * right tool, and it is the call that will run most often.
   */
  draft: 'claude-haiku-4-5-20251001',
  /** Open-ended trip questions, where the answer is not a known shape. */
  assistant: 'claude-sonnet-5',
} as const

export type ModelKey = keyof typeof MODELS

/**
 * Per-million-token rates used to turn logged token counts into a dollar figure.
 *
 * These are estimates for reporting, not billing. Rates change and are not verified
 * from within the app, so treat the cost column as an order-of-magnitude guide and
 * reconcile against the provider console before making a pricing decision on it.
 * Token counts themselves come straight from the API response and are exact.
 */
export const RATE_PER_MTOK: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 1, output: 5 },
  'claude-sonnet-5': { input: 3, output: 15 },
}

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const rate = RATE_PER_MTOK[model]
  if (!rate) return null
  return (inputTokens / 1_000_000) * rate.input + (outputTokens / 1_000_000) * rate.output
}
