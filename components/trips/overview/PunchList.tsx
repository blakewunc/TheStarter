'use client'

/**
 * What's actually left to do, replacing four metrics that measured nothing you could act on.
 *
 * The trip page previously showed "28 days away", "75% planned", "1/1 responded ·
 * 7 activities" and "69% of the way there" — two of those percentages looked like the
 * same kind of number and measured unrelated things (a checklist versus a clock), and
 * the checklist one counted "has at least one" so a trip with no lodging, no tee times
 * and nobody invited could read 75% planned.
 *
 * Every item here is derived from real data and goes somewhere. When the list is empty
 * it says so rather than inventing busywork to look useful.
 */

interface PunchListProps {
  expectedGuests: number | null
  memberCount: number
  pendingRsvpCount: number
  roundsPlanned: number | null
  teeTimeCount: number
  lodgingCount: number
  budgetCategoryCount: number
  isOrganizer: boolean
  onGo: (tab: string) => void
}

interface Task {
  label: string
  tab: string
}

export function PunchList({
  expectedGuests,
  memberCount,
  pendingRsvpCount,
  roundsPlanned,
  teeTimeCount,
  lodgingCount,
  budgetCategoryCount,
  isOrganizer,
  onGo,
}: PunchListProps) {
  const tasks: Task[] = []

  if (lodgingCount === 0) {
    tasks.push({ label: 'Add where you’re staying', tab: 'overview' })
  }

  // Only a shortfall against a stated plan is a task. A trip with no rounds_planned
  // is not behind on anything — it just has not said how many rounds it wants.
  if (roundsPlanned && teeTimeCount < roundsPlanned) {
    const missing = roundsPlanned - teeTimeCount
    tasks.push({
      label: `Book ${missing} more tee ${missing === 1 ? 'time' : 'times'}`,
      tab: 'golf',
    })
  }

  if (pendingRsvpCount > 0) {
    tasks.push({
      label: `${pendingRsvpCount} ${pendingRsvpCount === 1 ? 'player hasn’t' : 'players haven’t'} RSVP’d`,
      tab: 'overview',
    })
  }

  if (expectedGuests && memberCount < expectedGuests) {
    const missing = expectedGuests - memberCount
    tasks.push({ label: `Invite ${missing} more`, tab: 'overview' })
  }

  if (budgetCategoryCount === 0) {
    tasks.push({ label: 'Add what it costs', tab: 'financials' })
  }

  const card: React.CSSProperties = {
    background: '#fff',
    border: '0.5px solid rgba(28,26,23,0.10)',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: '20px',
  }

  if (tasks.length === 0) {
    return (
      <div style={card}>
        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#6B6460',
            margin: '0 0 6px',
          }}
        >
          Nothing outstanding
        </p>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: '#1C1A17', margin: 0 }}>
          The trip&rsquo;s ready. Go play golf.
        </p>
      </div>
    )
  }

  return (
    <div style={card}>
      <p
        style={{
          fontFamily: 'var(--sans)',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#6B6460',
          margin: '0 0 10px',
        }}
      >
        {tasks.length} {tasks.length === 1 ? 'thing' : 'things'} left
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {tasks.map((t) => (
          <li key={t.label}>
            <button
              onClick={() => onGo(t.tab)}
              // Full width and 44px tall: this is the primary thing to tap on the
              // screen, and it is the first block on a phone.
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                width: '100%',
                minHeight: '44px',
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                color: '#1C1A17',
              }}
            >
              <span>{t.label}</span>
              <span aria-hidden="true" style={{ color: '#3B6D11', flexShrink: 0 }}>
                &rarr;
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!isOrganizer && (
        <p style={{ fontFamily: 'var(--sans)', fontSize: '12px', color: '#6B6460', margin: '8px 0 0' }}>
          Your organizer is on it — this is just what&rsquo;s left.
        </p>
      )}
    </div>
  )
}
