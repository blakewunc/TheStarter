import { createClient } from '@/lib/supabase/server'

// Allow up to 60s for streaming AI responses (default is 10s on Vercel)
export const maxDuration = 60

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { tripId } = await params

    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
    }

    const { message, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { status: 500 })
    }

    // Fetch trip context in parallel
    const [tripResult, itineraryResult, budgetResult] = await Promise.all([
      supabase
        .from('trips')
        .select('*, trip_members(id, role, rsvp_status, profiles:user_id(display_name))')
        .eq('id', tripId)
        .single(),
      supabase
        .from('itinerary_items')
        .select('title, date, time, location, description')
        .eq('trip_id', tripId)
        .order('date')
        .order('time'),
      supabase
        .from('budget_categories')
        .select('name, estimated_cost')
        .eq('trip_id', tripId),
    ])

    const trip = tripResult.data
    if (!trip) {
      return new Response(JSON.stringify({ error: 'Trip not found' }), { status: 404 })
    }

    const itinerary = itineraryResult.data || []
    const budget = budgetResult.data || []

    const systemPrompt = buildSystemPrompt(trip, itinerary, budget)

    const messages = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Call Anthropic API directly via fetch (avoids SDK bundling issues on Vercel)
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        stream: true,
        system: systemPrompt,
        messages,
      }),
    })

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      console.error('Anthropic API error:', anthropicResponse.status, errText)
      let detail = `AI service error ${anthropicResponse.status}`
      try {
        const errJson = JSON.parse(errText)
        detail = errJson.error?.message || detail
      } catch {
        detail = errText || detail
      }
      return new Response(
        JSON.stringify({ error: detail }),
        { status: 502 }
      )
    }

    // Pipe the SSE stream, extracting text deltas
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const reader = anthropicResponse.body!.getReader()

    const readableStream = new ReadableStream({
      async start(controller) {
        let buffer = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const event = JSON.parse(data)
                if (
                  event.type === 'content_block_delta' &&
                  event.delta?.type === 'text_delta'
                ) {
                  controller.enqueue(encoder.encode(event.delta.text))
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('AI assistant error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500 }
    )
  }
}

function buildSystemPrompt(trip: any, itinerary: any[], budget: any[]): string {
  const memberCount = trip.trip_members?.length || 0
  const acceptedCount =
    trip.trip_members?.filter((m: any) => m.rsvp_status === 'accepted').length || memberCount
  const memberNames =
    trip.trip_members
      ?.map((m: any) => m.profiles?.display_name || 'Unknown')
      .join(', ') || 'None listed'

  const existingItinerary =
    itinerary.length > 0
      ? itinerary
          .map(
            (item) =>
              `- ${item.date}${item.time ? ` at ${item.time}` : ''}: ${item.title}${item.location ? ` (${item.location})` : ''}`
          )
          .join('\n')
      : 'No activities planned yet.'

  const budgetSummary =
    budget.length > 0
      ? budget.map((cat) => `- ${cat.name}: $${cat.estimated_cost}`).join('\n')
      : 'No budget categories set.'

  const tripTypeContext = getTripTypeContext(trip.trip_type)

  return `You are an expert trip planning assistant for The Starter, a collaborative golf trip planning app.

## Trip Details
- **Trip Name**: ${trip.title}
- **Destination**: ${trip.destination}
- **Type**: ${trip.trip_type || 'general'}
- **Dates**: ${trip.start_date} to ${trip.end_date}
- **Status**: ${trip.status}
- **Group Size**: ${memberCount} members (${acceptedCount} confirmed)
- **Members**: ${memberNames}
- **Total Budget**: ${trip.budget_total ? `$${trip.budget_total}` : 'Not set'}
- **Description**: ${trip.description || 'None'}

## Current Itinerary
${existingItinerary}

## Budget Categories
${budgetSummary}

## Your Role
${tripTypeContext}

You are conversational, enthusiastic, and helpful. You know a lot about travel destinations, restaurants, activities, and logistics. When the user asks for suggestions, provide specific, actionable recommendations for their destination.

## CRITICAL: Suggestion Format
When you suggest activities that could be added to the itinerary, you MUST format each suggestion using this exact marker format so the app can parse them into "Add to Itinerary" buttons:

[SUGGESTION]{"title":"Activity Name","date":"YYYY-MM-DD","time":"HH:MM","location":"Venue Name, City","description":"Brief description"}[/SUGGESTION]

Rules for suggestions:
- The date MUST be between ${trip.start_date} and ${trip.end_date}
- Time should be in 24-hour format (e.g., "08:00", "14:30")
- Always include a location when possible
- Keep descriptions concise (1-2 sentences)
- You can include multiple suggestions in a single response
- Place each suggestion on its own line, embedded naturally in your response text
- Do NOT put suggestions inside code blocks
- If the user hasn't specified a date preference, spread suggestions across the trip dates
- Check the existing itinerary above to avoid scheduling conflicts

## Response Style
- Be concise but informative
- Use natural language around the suggestion blocks
- When providing a sample schedule, include suggestion blocks for each activity
- If asked about things that are NOT itinerary items (general tips, what to pack, etc.), respond normally without suggestion blocks
- Be aware of the trip type and tailor suggestions accordingly`
}

function getTripTypeContext(tripType: string | null): string {
  switch (tripType) {
    case 'golf':
      return 'This is a GOLF TRIP. Focus on: golf courses (public, semi-private, resort), tee time recommendations, best times to play, driving ranges, pro shops, post-round dining, golf-friendly restaurants and bars, and 19th hole spots. Consider skill levels and course difficulty.'
    case 'ski':
      return 'This is a SKI TRIP. Focus on: ski resorts, trail recommendations by difficulty, lift ticket strategies, ski rental shops, apres-ski dining and bars, mountain lodges, and weather considerations. Consider ability levels.'
    case 'bachelor_party':
      return 'This is a BACHELOR PARTY. Focus on: group-friendly activities, nightlife, restaurants with large group capacity, unique experiences, day activities (go-karts, golf, boats, etc.), and memorable group bonding experiences. Keep it fun and exciting.'
    case 'bachelorette_party':
      return 'This is a BACHELORETTE PARTY. Focus on: group-friendly activities, spa experiences, brunch spots, nightlife, wine/cocktail experiences, group dining, pool parties, and memorable bonding activities. Keep it celebratory and fun.'
    default:
      return 'This is a general group trip. Suggest activities, dining, and experiences suitable for groups. Consider the destination and dates for seasonal activities.'
  }
}
