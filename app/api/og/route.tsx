import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// The whole distribution model is an organizer pasting a link into a group chat.
// Without an og:image those links render as grey stubs in iMessage, WhatsApp and Slack,
// which is where every invitee forms their first impression of the product.
//
// Deliberately no external font fetch. A font request that fails or times out takes the
// whole image down, and a link preview that fails is worse than one in a plain typeface.

const PAPER = '#F5F1ED'
const INK = '#1C1A17'
const INK_SOFT = '#6B6460'
const INK_FAINT = '#A09890'
const PINE = '#3B6D11'

function clamp(value: string | null, max: number): string {
  if (!value) return ''
  const trimmed = value.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const title = clamp(searchParams.get('title'), 70) || 'The Starter'
  const eyebrow = clamp(searchParams.get('eyebrow'), 40)
  const subtitle = clamp(searchParams.get('subtitle'), 60)
  // Free-form stat line, e.g. "8 players · 3 rounds · Sep 24–27"
  const meta = clamp(searchParams.get('meta'), 60)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '64px 72px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top rule + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: INK_FAINT,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            The Starter
          </div>
          <div style={{ display: 'flex', height: 10, width: 10, borderRadius: 10, background: PINE }} />
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 24,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: PINE,
                marginBottom: 20,
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 40 ? 66 : 82,
              lineHeight: 1.05,
              color: INK,
              letterSpacing: '-0.01em',
              maxWidth: 960,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 32,
                color: INK_SOFT,
                marginTop: 22,
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Stat line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontSize: 26,
              color: meta ? INK : INK_FAINT,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {meta || 'Golf trips, handled.'}
          </div>
          <div
            style={{
              fontSize: 22,
              color: INK_FAINT,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            thestarter.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
