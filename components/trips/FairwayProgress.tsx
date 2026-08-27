'use client'

/**
 * The fairway: a ball putting toward the hole as the trip approaches.
 *
 * Extracted from PuttingCountdown so it can be reused on trip cards, empty states and
 * the recap (0.4). It takes progress rather than dates, so the caller decides what the
 * ball means.
 *
 * What it must NOT mean: how much of the planning is done. A ball that reaches the hole
 * when the checklist is finished sinks the putt weeks before anyone tees off, which is
 * both an anticlimax and a lie about what is coming. Progress here is time until the
 * trip, and the ball drops on trip day.
 */

interface FairwayProgressProps {
  /** 0 = booking window opens, 1 = trip day. Clamped. */
  progress: number
  /** Drives the flag label; 0 or less reads as arrival. */
  daysUntil: number
}

const BALL_START_X = 60
const HOLE_X = 926

export function FairwayProgress({ progress, daysUntil }: FairwayProgressProps) {
  const pct = Math.min(1, Math.max(0, progress))
  const ballX = Math.round(BALL_START_X + (HOLE_X - BALL_START_X - 10) * pct)

  return (
      <div style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        background: '#E8E4DC',
        border: '0.5px solid rgba(28,26,23,0.10)',
      }}>
        <svg
          viewBox="0 0 1000 110"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%' }}
        >
          {/* Sky */}
          <rect x="0" y="0" width="1000" height="110" fill="#E8E4DC" />

          {/* Fairway */}
          <rect x="0" y="62" width="1000" height="48" fill="#7A9E5A" />
          <rect x="0" y="62" width="1000" height="8" fill="#8AAE64" />
          <line x1="0" y1="62" x2="1000" y2="62" stroke="rgba(28,26,23,0.12)" strokeWidth="0.8" />

          {/* Fairway stripe bands */}
          {[0, 200, 400, 600, 800].map(x => (
            <rect key={x} x={x} y="70" width="100" height="40" fill="rgba(255,255,255,0.04)" />
          ))}

          {/* Hole cup */}
          <ellipse cx="938" cy="63" rx="11" ry="4.5" fill="rgba(28,26,23,0.55)" />
          {/* Flag pole */}
          <line x1="938" y1="15" x2="938" y2="63" stroke="#1C1A17" strokeWidth="1.2" />
          {/* Flag pennant */}
          <polygon points="938,15 962,22 938,29" fill="#1C1A17" />

          {/* Distance dashes */}
          <line
            x1="100" y1="63" x2="920" y2="63"
            stroke="rgba(245,241,237,0.25)"
            strokeWidth="0.8"
            strokeDasharray="4,8"
          />

          {/* Golf ball */}
          <circle cx={ballX} cy="62" r="6" fill="#F5F1ED" stroke="rgba(28,26,23,0.25)" strokeWidth="0.8" />
          <circle cx={ballX - 2.5} cy="60" r="1.5" fill="rgba(28,26,23,0.08)" />

          {/* Golfer stick figure */}
          <ellipse cx="52" cy="64" rx="18" ry="3" fill="rgba(28,26,23,0.12)" />
          <line x1="44" y1="52" x2="38" y2="64" stroke="#1C1A17" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="44" y1="52" x2="50" y2="64" stroke="#1C1A17" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="44" y1="52" x2="48" y2="37" stroke="#1C1A17" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="48" cy="31" r="7" fill="#1C1A17" />
          <line x1="43" y1="27" x2="57" y2="27" stroke="#1C1A17" strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="40" x2="58" y2="50" stroke="#1C1A17" strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="44" x2="58" y2="50" stroke="#1C1A17" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="50" x2="62" y2="64" stroke="#1C1A17" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="57" y="63" width="10" height="2.5" rx="1" fill="#1C1A17" />

          {/* Day counter above ball */}
          {daysUntil > 0 && (
            <text
              x={ballX}
              y="52"
              textAnchor="middle"
              fontFamily="var(--sans)"
              fontSize="9"
              fill="rgba(28,26,23,0.55)"
              fontWeight="400"
            >
              {daysUntil}d
            </text>
          )}
          {daysUntil <= 0 && (
            <text
              x={ballX}
              y="52"
              textAnchor="middle"
              fontFamily="var(--sans)"
              fontSize="9"
              fill="rgba(28,26,23,0.55)"
            >
              Now
            </text>
          )}

          {/* "Trip day" near hole */}
          <text
            x="938"
            y="50"
            textAnchor="middle"
            fontFamily="var(--serif)"
            fontSize="11"
            fill="rgba(28,26,23,0.4)"
            fontStyle="italic"
          >
            Trip day
          </text>
        </svg>
      </div>
  )
}
