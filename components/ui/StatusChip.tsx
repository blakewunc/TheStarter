/**
 * Trip status, rendered legibly.
 *
 * Previously this existed twice and disagreed with itself: TripHeader used Tailwind
 * defaults (bg-blue-100 / bg-green-100), which is the cool-grey system the rest of the
 * product moved away from, and the trip card used rgba(245,241,237,0.45) — translucent
 * warm-white on a dark header, so the single most important fact on the card was the
 * faintest thing on it.
 *
 * Colours come from the status semantics in globals.css: pine confirmed, sand planning,
 * clay cancelled, neutral completed.
 */

type Status = 'planning' | 'confirmed' | 'completed' | 'cancelled' | (string & {})

const ON_LIGHT: Record<string, string> = {
  confirmed: 'bg-[#EAF3DE] text-[#3B6D11]',
  planning: 'bg-[#EDE7DA] text-[#7A5E38]',
  cancelled: 'bg-[#FEF2F2] text-[#8B4444]',
  completed: 'bg-[#EDECE6] text-[#1C1A17]',
}

// On the dark card header the fill is a tint of the ground and the text is a light
// tone of the same hue, so each status stays recognisable without going translucent.
const ON_DARK: Record<string, string> = {
  confirmed: 'bg-[#3B6D11]/25 text-[#C0DD97]',
  planning: 'bg-[#B8956A]/25 text-[#E8CFA9]',
  cancelled: 'bg-[#8B4444]/25 text-[#E8B4B4]',
  completed: 'bg-white/15 text-[#EDECE6]',
}

const FALLBACK_LIGHT = 'bg-[#EDECE6] text-[#1C1A17]'
const FALLBACK_DARK = 'bg-white/15 text-[#EDECE6]'

export function StatusChip({
  status,
  ground = 'light',
  className = '',
}: {
  status: Status | null | undefined
  /** The surface behind the chip, which decides whether it needs light or dark tones. */
  ground?: 'light' | 'dark'
  className?: string
}) {
  if (!status) return null

  const key = String(status).toLowerCase()
  const tone =
    ground === 'dark'
      ? ON_DARK[key] ?? FALLBACK_DARK
      : ON_LIGHT[key] ?? FALLBACK_LIGHT

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${tone} ${className}`}
    >
      {status}
    </span>
  )
}
