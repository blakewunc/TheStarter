import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateInviteCode } from '@/lib/utils/invite-code'

const TEMPLATES = {
  pinehurst: {
    title: 'Pinehurst No. 2 & Beyond',
    destination: 'Southern Pines, NC',
    trip_type: 'golf',
    description: '3-night bucket list golf trip: Pinehurst No. 2, The Cradle, and the best of the Sandhills.',
    nights: 3,
    itinerary: [
      // Day 1 — Arrival
      { offset: 0, time: '15:00', title: 'Arrive & Check In', location: 'Pinehurst Resort', description: 'Check into the Carolina Hotel or Holly Inn. Settle in and get your bearings.', sort_order: 0 },
      { offset: 0, time: '16:30', title: 'Warm-Up Round — No. 3 or No. 5', location: 'Pinehurst Resort', description: 'Ease into the Pinehurst greens. More forgiving courses — great warm-up for championship day tomorrow.', sort_order: 1 },
      { offset: 0, time: '18:30', title: 'The Cradle (Par-3 Short Course)', location: 'The Cradle, Pinehurst', description: 'Music, drinks, closest-to-pin games. One of the best experiences in golf right now.', sort_order: 2 },
      { offset: 0, time: '20:00', title: 'Dinner — The Deuce', location: 'The Deuce, Pinehurst Resort', description: 'Overlooks the 18th hole of No. 2. Casual but iconic — perfect first night.', sort_order: 3 },
      // Day 2 — Championship Day
      { offset: 1, time: '08:00', title: 'Pinehurst No. 2 — The Bucket List Round', location: 'Pinehurst No. 2', description: 'Donald Ross design. Turtleback greens punish every miss — caddie highly recommended here.', sort_order: 4 },
      { offset: 1, time: '13:00', title: 'Lunch at the Clubhouse', location: 'Pinehurst Clubhouse', description: 'Refuel at the halfway house or main clubhouse. Relive the morning\'s highlights.', sort_order: 5 },
      { offset: 1, time: '14:30', title: 'Afternoon Round — No. 4 (Optional)', location: 'Pinehurst No. 4', description: 'Slightly more modern feel but still elite quality. Skip if the crew needs a nap.', sort_order: 6 },
      { offset: 1, time: '19:00', title: 'Dinner — Villaggio Ristorante', location: 'Villaggio Ristorante & Bar, Pinehurst', description: 'Best Italian in the area. Great for the nicer group dinner night.', sort_order: 7 },
      { offset: 1, time: '21:00', title: 'Village Bar Hop', location: 'Pinehurst Village', description: 'Drum & Quill Public House → Dugan\'s Pub. Settle the bets from today.', sort_order: 8 },
      // Day 3 — Competitive Day
      { offset: 2, time: '08:00', title: 'Morning Round — Off-Property', location: 'Tobacco Road / Mid Pines / Pine Needles', description: 'Tobacco Road: wild & visually insane. Mid Pines: classic Donald Ross. Pine Needles: championship pedigree. Crew\'s call.', sort_order: 9 },
      { offset: 2, time: '14:00', title: 'Afternoon — Free Time', location: 'Pinehurst', description: 'Replay 9, putting green, or just decompress. Optional drinks at the resort.', sort_order: 10 },
      { offset: 2, time: '18:30', title: 'Final Dinner — Pinehurst Brewing Co.', location: 'Pinehurst Brewing Company', description: 'Great craft beer + casual group vibe. Final night stories and settling bets.', sort_order: 11 },
      // Day 4 — Departure
      { offset: 3, time: '09:00', title: 'Breakfast & Check Out', location: 'Pinehurst Resort', description: 'Casual breakfast. Optional quick 9 or putting green before heading out.', sort_order: 12 },
      { offset: 3, time: '11:00', title: 'Head Out', location: 'Southern Pines, NC', description: 'About 2 hours to Charlotte. Safe travels — already planning the next one.', sort_order: 13 },
    ],
    budget_categories: [
      { name: 'Lodging', split_type: 'equal', description: 'Pinehurst Resort or group house — 3 nights per person', base_per_person: 900 },
      { name: 'Golf — Pinehurst No. 2', split_type: 'equal', description: 'Green fee + caddie (highly recommended)', base_per_person: 500 },
      { name: 'Golf — Additional Rounds', split_type: 'equal', description: 'No. 3/4/5, Tobacco Road, Mid Pines, or Pine Needles', base_per_person: 400 },
      { name: 'Food & Drinks', split_type: 'equal', description: 'Dinners, The Cradle, meals — 3 days', base_per_person: 300 },
      { name: 'Miscellaneous', split_type: 'equal', description: 'Tips, extras, Cradle drinks, souvenirs', base_per_person: 100 },
    ],
  },
  'pebble-beach': {
    title: 'Pebble Beach & Monterey Peninsula',
    destination: 'Pebble Beach, CA',
    trip_type: 'golf',
    description: '4-night bucket list trip: Pebble Beach Golf Links, Spyglass Hill, and the full Monterey Peninsula experience.',
    nights: 4,
    itinerary: [
      // Day 1 — Arrival
      { offset: 0, time: '15:00', title: 'Arrive & Check In', location: 'The Lodge at Pebble Beach', description: 'Fly into Monterey (MRY) or San Jose (SJC, ~1.5 hr drive). Check into The Lodge or The Inn at Spanish Bay.', sort_order: 0 },
      { offset: 0, time: '17:00', title: 'Walk the Property', location: 'Pebble Beach Resort', description: 'Walk 18th hole bluff, get your bearings, and let it sink in that you\'re actually here.', sort_order: 1 },
      { offset: 0, time: '18:30', title: 'Drinks — The Bench', location: 'The Bench, Pebble Beach', description: 'Casual opening drinks with views. Set the tone for the trip.', sort_order: 2 },
      { offset: 0, time: '19:30', title: 'Dinner — Stillwater Bar & Grill', location: 'Stillwater Bar & Grill, Pebble Beach', description: 'Overlooks the 18th hole of Pebble. Iconic first night — book well in advance.', sort_order: 3 },
      // Day 2 — Main Event
      { offset: 1, time: '08:00', title: 'Pebble Beach Golf Links — The Bucket List Round', location: 'Pebble Beach Golf Links', description: 'One of the most famous courses in the world. Holes 4–10 along the ocean are unreal. Take a caddie — non-negotiable.', sort_order: 4 },
      { offset: 1, time: '13:30', title: 'Lunch + Soak It In', location: 'Pebble Beach Clubhouse', description: 'Don\'t rush. This is the round you\'ll talk about for 10 years. Relive every hole.', sort_order: 5 },
      { offset: 1, time: '15:30', title: 'Relax — Spa / Nap / Putting Green', location: 'Pebble Beach Resort', description: 'Recovery mode. Spa, pool, or just sit on the porch and stare at the ocean.', sort_order: 6 },
      { offset: 1, time: '19:00', title: 'Dinner — Roy\'s at Pebble Beach', location: 'Roy\'s, Pebble Beach', description: 'Hawaiian fusion. Great post-round dinner with elevated flavors and good cocktails.', sort_order: 7 },
      // Day 3 — Spyglass + Spanish Bay
      { offset: 2, time: '08:00', title: 'Spyglass Hill Golf Course', location: 'Spyglass Hill, Pebble Beach', description: 'Harder than Pebble. Stunning mix of coastal and forest holes. Caddies optional but helpful here too.', sort_order: 8 },
      { offset: 2, time: '14:00', title: '17-Mile Drive', location: 'Pebble Beach', description: 'Drive the iconic route: Lone Cypress, Ghost Tree, Fanshell Beach. Stop, get out, take it in.', sort_order: 9 },
      { offset: 2, time: '17:30', title: 'Bagpiper Sunset Ceremony at Spanish Bay', location: 'The Inn at Spanish Bay', description: 'A bagpiper plays at sunset every evening on the 18th at Spanish Bay. Fire pits, drinks, incredible vibe. Do not skip this.', sort_order: 10 },
      { offset: 2, time: '19:30', title: 'Dinner — The Tap Room', location: 'The Tap Room, Pebble Beach', description: 'Classic steakhouse feel. Great for the group after a competitive day.', sort_order: 11 },
      // Day 4 — Flexible Golf + Carmel
      { offset: 3, time: '08:00', title: 'Morning Round — Spanish Bay, Pacific Grove, or Pasatiempo', location: 'Monterey Peninsula', description: 'The Links at Spanish Bay (true links, windy), Pacific Grove Golf Links (back 9 = poor man\'s Pebble), or Pasatiempo (MacKenzie design, Augusta ties). Crew\'s call.', sort_order: 12 },
      { offset: 3, time: '14:00', title: 'Carmel-by-the-Sea', location: 'Carmel, CA', description: 'Walk the village, drinks, beach. The perfect decompression afternoon after 3 rounds.', sort_order: 13 },
      { offset: 3, time: '19:00', title: 'Final Dinner — La Bicyclette', location: 'La Bicyclette, Carmel', description: 'Best group dinner in the area. More local, less resort vibe. Great way to close out the trip.', sort_order: 14 },
      // Day 5 — Departure
      { offset: 4, time: '09:00', title: 'Breakfast Overlooking the Ocean', location: 'Pebble Beach Resort', description: 'Take your time. Optional short practice session on the putting green.', sort_order: 15 },
      { offset: 4, time: '11:00', title: 'Head Out', location: 'Monterey, CA', description: 'Back to MRY or SJC. Already planning the return trip.', sort_order: 16 },
    ],
    budget_categories: [
      { name: 'Lodging (4 nights)', split_type: 'equal', description: 'The Lodge or Inn at Spanish Bay — required for guaranteed Pebble tee time', base_per_person: 2500 },
      { name: 'Golf — Pebble Beach', split_type: 'equal', description: 'Green fee + caddie (non-negotiable)', base_per_person: 625 },
      { name: 'Golf — Spyglass Hill', split_type: 'equal', description: 'Green fee + optional caddie', base_per_person: 450 },
      { name: 'Golf — Day 4 Round', split_type: 'equal', description: 'Spanish Bay, Pacific Grove, or Pasatiempo', base_per_person: 350 },
      { name: 'Food & Drinks', split_type: 'equal', description: 'Stillwater, Roy\'s, Tap Room, Carmel dinner — 4 days', base_per_person: 800 },
      { name: 'Miscellaneous', split_type: 'equal', description: 'Tips, 17-Mile Drive toll, extras, Carmel shopping', base_per_person: 300 },
    ],
  },
  'scottish-pilgrimage': {
    title: 'Scottish Links Pilgrimage',
    destination: 'St Andrews, Scotland',
    trip_type: 'golf',
    description: '7-night St Andrews-based pilgrimage: Old Course ballot attempt, Carnoustie, Kingsbarns, and Dumbarnie. Old Course is aspirational — the itinerary is built to give you the best possible odds.',
    nights: 7,
    itinerary: [
      // Day 1 — Arrive
      { offset: 0, time: '12:00', title: 'Fly into Edinburgh', location: 'Edinburgh Airport (EDI)', description: 'Fly into Edinburgh. Domestic from London or direct from US. Pick up rental car — you\'ll need it.', sort_order: 0 },
      { offset: 0, time: '14:00', title: 'Transfer to St Andrews (~1.5 hrs)', location: 'St Andrews, Fife', description: 'Drive through Fife. First views of the town and the Old Course from the road. It hits different.', sort_order: 1 },
      { offset: 0, time: '16:00', title: 'Check In + Walk the Town', location: 'St Andrews', description: 'Walk the West Sands beach, the Old Course, and the Swilcan Bridge. It\'s free to walk. Don\'t skip this.', sort_order: 2 },
      { offset: 0, time: '17:00', title: 'Enter Old Course Ballot (Day 3 attempt)', location: 'St Andrews Links', description: 'Submit ballot entry online at standrews.com for your first Old Course attempt. Odds are roughly 20% per entry but improve with more days.', sort_order: 3 },
      { offset: 0, time: '19:30', title: 'Dinner — The Seafood Ristorante', location: 'The Seafood Ristorante, St Andrews', description: 'Best restaurant in St Andrews. Elevated Scottish seafood. Book ahead.', sort_order: 4 },
      // Day 2 — Warm-Up
      { offset: 1, time: '08:30', title: 'Round 1 — New Course or Dumbarnie Links', location: 'St Andrews New Course / Dumbarnie Links', description: 'New Course: challenging, historic, excellent. Dumbarnie: modern links (2020), stunning views, very bookable. Ease into Scottish golf.', sort_order: 5 },
      { offset: 1, time: '14:00', title: 'Afternoon — Range + Recovery', location: 'St Andrews', description: 'Driving range, putting green, or just walk the Old Course again. Get the feel of links turf.', sort_order: 6 },
      { offset: 1, time: '17:00', title: 'Enter Ballot (Day 4 attempt)', location: 'St Andrews Links', description: 'Second ballot entry. Odds compound with each day you\'re here.', sort_order: 7 },
      { offset: 1, time: '19:00', title: 'Dinner + Pub Night — Rusacks or The Dunvegan', location: 'St Andrews', description: 'Drinks with a view of the 18th at Rusacks. Or pub crawl: The Dunvegan, The Central, Ma Bells.', sort_order: 8 },
      // Day 3 — Old Course Attempt
      { offset: 2, time: '07:00', title: '🎯 Old Course Ballot Result Day', location: 'St Andrews Links', description: 'BALLOT SUCCESS → You\'re playing the Old Course today. The round of your life. Take a caddie — no exceptions.\n\nBALLOT FAILURE → You\'re playing Kingsbarns Golf Links instead. Still exceptional.', sort_order: 9 },
      { offset: 2, time: '13:00', title: 'Lunch + Replay the Round', location: 'St Andrews Clubhouse', description: 'Whatever happened, the morning is worth talking about over lunch.', sort_order: 10 },
      { offset: 2, time: '17:00', title: 'Enter Ballot (Day 5 attempt)', location: 'St Andrews Links', description: 'Keep entering. The more days you\'re here, the better your cumulative odds.', sort_order: 11 },
      { offset: 2, time: '20:00', title: 'Dinner — The Peat Inn', location: 'The Peat Inn, Cupar (20 min)', description: 'Michelin-star restaurant 20 mins from St Andrews. Exceptional. Worth the drive for the nicer dinner.', sort_order: 12 },
      // Day 4 — Premium Round
      { offset: 3, time: '08:30', title: 'Round 3 — Kingsbarns (if not played) or Dumbarnie', location: 'Kingsbarns Golf Links / Dumbarnie Links', description: 'Kingsbarns is premium, bookable, and genuinely world-class. Ocean views on nearly every hole. If you played it on Day 3, Dumbarnie is a great alternative.', sort_order: 13 },
      { offset: 3, time: '14:00', title: 'Afternoon — Explore Fife Coast', location: 'East Neuk of Fife', description: 'Crail, Anstruther fish and chips (best in Scotland), Pittenweem harbour. Short drives but a proper taste of the Scottish coast.', sort_order: 14 },
      { offset: 3, time: '17:00', title: 'Enter Ballot (Day 6 attempt)', location: 'St Andrews Links', description: 'Final primary ballot entry for an Old Course shot.', sort_order: 15 },
      // Day 5 — Carnoustie
      { offset: 4, time: '07:30', title: 'Drive to Carnoustie (45 mins)', location: 'Carnoustie Golf Links', description: 'The hardest course of the trip. Championship Links — where Jean Van de Velde melted down in \'99. Brutal in wind.', sort_order: 16 },
      { offset: 4, time: '08:30', title: 'Round 4 — Carnoustie Championship Links', location: 'Carnoustie, Angus', description: 'The Barry Burn on 18 is iconic. Bring your A-game or accept the suffering with grace. Every bit as hard as advertised.', sort_order: 17 },
      { offset: 4, time: '14:00', title: 'Lunch in Dundee or Arbroath', location: 'Dundee / Arbroath', description: 'Arbroath smokie (smoked haddock) in Arbroath itself — or a proper lunch in Dundee before heading back.', sort_order: 18 },
      { offset: 4, time: '19:30', title: 'Dinner — The Criterion Restaurant', location: 'St Andrews', description: 'Classic St Andrews spot for a good group meal at a reasonable price.', sort_order: 19 },
      // Day 6 — Flex / Final Attempt
      { offset: 5, time: '08:00', title: '🎯 Old Course Final Attempt (Ballot or Replay)', location: 'St Andrews Links', description: 'If ballot success: play the Old Course — or play it again if you already succeeded earlier.\n\nIf ballot fails: replay your favorite course from the week, or play the Jubilee Course (excellent, less famous).', sort_order: 20 },
      { offset: 5, time: '15:00', title: 'Afternoon — Free Time in St Andrews', location: 'St Andrews', description: 'Golf Museum, Bottle Dungeon, cathedral ruins. Or just sit at the 18th with a drink.', sort_order: 21 },
      { offset: 5, time: '19:30', title: 'Celebration Dinner — Playfair\'s', location: 'Playfair\'s, St Andrews', description: 'Good Scottish bistro. Great for a final night out and celebrating whatever golf you played this week.', sort_order: 22 },
      // Day 7 — Light Day
      { offset: 6, time: '09:00', title: 'Morning — Town, Golf Shop, Souvenirs', location: 'St Andrews', description: 'The golf shop on Golf Place. St Andrews-branded stuff is actually worth buying here. Old Tom Morris shop too.', sort_order: 23 },
      { offset: 6, time: '11:00', title: 'Optional: Eden Course or Putting Green', location: 'St Andrews Eden Course', description: 'Eden Course is relaxed, cheap, and fun. Perfect for a final easy 9 before heading out.', sort_order: 24 },
      { offset: 6, time: '14:00', title: 'Drive back to Edinburgh', location: 'Edinburgh', description: 'Check in near the airport for an early morning flight.', sort_order: 25 },
      { offset: 6, time: '19:00', title: 'Final Night — Edinburgh Old Town', location: 'Edinburgh', description: 'Dinner and drinks in Edinburgh. The Royal Mile, Grassmarket. Proper end to the trip.', sort_order: 26 },
      // Day 8 — Departure
      { offset: 7, time: '06:00', title: 'Fly Home', location: 'Edinburgh Airport (EDI)', description: 'Already looking up Old Course ballot dates for next year.', sort_order: 27 },
    ],
    budget_categories: [
      { name: 'Flights (transatlantic)', split_type: 'equal', description: 'US to Edinburgh return — book early for better rates', base_per_person: 1200 },
      { name: 'Lodging (7 nights)', split_type: 'equal', description: 'St Andrews hotel or self-catering cottage — 7 nights', base_per_person: 1750 },
      { name: 'Golf — Old Course', split_type: 'equal', description: 'If ballot is successful (~20–60% odds per entry)', base_per_person: 250 },
      { name: 'Golf — Carnoustie', split_type: 'equal', description: 'Championship Links green fee', base_per_person: 200 },
      { name: 'Golf — Kingsbarns', split_type: 'equal', description: 'Premium coastal links — highly recommended', base_per_person: 275 },
      { name: 'Golf — Dumbarnie + New Course', split_type: 'equal', description: 'Two additional rounds', base_per_person: 280 },
      { name: 'Food & Drinks (7 days)', split_type: 'equal', description: 'Dinners, pub nights, lunches on the road', base_per_person: 700 },
      { name: 'Car Rental + Transport', split_type: 'equal', description: 'Rental car for the week + Carnoustie day trip', base_per_person: 300 },
    ],
  },
} as const

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { template, start_date, end_date, expected_guests } = body

    if (!template || !start_date || !end_date) {
      return NextResponse.json({ error: 'template, start_date, and end_date are required' }, { status: 400 })
    }

    const tmpl = TEMPLATES[template as keyof typeof TEMPLATES]
    if (!tmpl) {
      return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
    }

    const guests = Math.max(1, parseInt(expected_guests) || 4)
    const invite_code = generateInviteCode()
    const totalBudget = tmpl.budget_categories.reduce((sum, cat) => sum + cat.base_per_person, 0) * guests

    // Create trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        title: tmpl.title,
        destination: tmpl.destination,
        trip_type: tmpl.trip_type,
        start_date,
        end_date,
        description: tmpl.description,
        expected_guests: guests,
        budget_total: totalBudget,
        created_by: user.id,
        invite_code,
        status: 'planning',
      })
      .select()
      .single()

    if (tripError || !trip) {
      console.error('Error creating trip:', tripError)
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
    }

    // Seed itinerary items
    const startDate = new Date(start_date + 'T00:00:00')
    const itineraryInserts = tmpl.itinerary.map((item) => {
      const itemDate = new Date(startDate)
      itemDate.setDate(itemDate.getDate() + item.offset)
      return {
        trip_id: trip.id,
        date: itemDate.toISOString().split('T')[0],
        time: item.time,
        title: item.title,
        location: item.location,
        description: item.description,
        sort_order: item.sort_order,
        created_by: user.id,
      }
    })

    const { error: itinError } = await supabase.from('itinerary_items').insert(itineraryInserts)
    if (itinError) console.error('Error seeding itinerary:', itinError)

    // Seed budget categories
    const budgetInserts = tmpl.budget_categories.map((cat, idx) => ({
      trip_id: trip.id,
      name: cat.name,
      split_type: cat.split_type,
      description: cat.description,
      estimated_cost: cat.base_per_person * guests,
      sort_order: idx,
    }))

    const { error: budgetError } = await supabase.from('budget_categories').insert(budgetInserts)
    if (budgetError) console.error('Error seeding budget:', budgetError)

    return NextResponse.json({ trip }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
