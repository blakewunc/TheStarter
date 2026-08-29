/**
 * Golf scoring maths. Deterministic, testable, and deliberately not AI (B.1).
 *
 * These are the numbers a league is settled on. A language model that is usually right
 * about arithmetic is worse than useless here — it cannot be unit tested, it costs money
 * per call, and a wrong differential quietly corrupts a season's standings rather than
 * failing visibly.
 */

/** Neutral slope. A course of average difficulty for a bogey golfer rates 113. */
const NEUTRAL_SLOPE = 113

export interface TeeSet {
  course_rating: number
  slope: number
  par: number
}

/**
 * Score differential — how a round compares to the course, so a round in Charlotte can
 * be set against a round in Austin. Lower is better.
 *
 *   differential = (113 / slope) × (gross − course rating)
 */
export function scoreDifferential(gross: number, tee: TeeSet): number {
  const raw = (NEUTRAL_SLOPE / tee.slope) * (gross - tee.course_rating)
  return Math.round(raw * 10) / 10
}

/**
 * How many of a golfer's best differentials count toward their index.
 *
 * WHS uses the best 8 of the most recent 20, with a reduced schedule below 20 rounds so
 * a newcomer is not judged on a single bad afternoon. Reproduced here because a league
 * that waits for 20 rounds before showing anyone a number is a league nobody uses in
 * its first season.
 */
export function countingRounds(total: number): number {
  if (total < 3) return 0
  if (total === 3) return 1
  if (total === 4) return 1
  if (total === 5) return 1
  if (total === 6) return 2
  if (total <= 8) return 2
  if (total <= 11) return 3
  if (total <= 14) return 4
  if (total <= 16) return 5
  if (total <= 18) return 6
  if (total === 19) return 7
  return 8
}

/**
 * The Starter Index — average of the lowest N differentials from the most recent 20.
 *
 * Deliberately not called a Handicap Index. That is a licensed product of allied golf
 * associations with its own adjustments and safeguards; this is a house number for these
 * leagues. Saying so plainly is both accurate and better copy than implying otherwise.
 *
 * Returns null below three rounds, because a number derived from one afternoon invites
 * more trust than it deserves.
 */
export function starterIndex(differentials: number[]): number | null {
  const recent = differentials.slice(0, 20)
  const counting = countingRounds(recent.length)
  if (counting === 0) return null

  const best = [...recent].sort((a, b) => a - b).slice(0, counting)
  const mean = best.reduce((sum, d) => sum + d, 0) / best.length
  return Math.round(mean * 10) / 10
}

/**
 * Strokes received at a given course, from an index.
 *
 *   course handicap = index × (slope / 113) + (course rating − par)
 */
export function courseHandicap(index: number, tee: TeeSet): number {
  return Math.round(index * (tee.slope / NEUTRAL_SLOPE) + (tee.course_rating - tee.par))
}

/**
 * Stableford points for one hole, net of strokes received.
 * Rewards playing the hole out rather than protecting a number.
 */
export function stablefordPoints(netStrokes: number, par: number): number {
  const relative = netStrokes - par
  if (relative >= 2) return 0
  return Math.max(0, 2 - relative)
}
