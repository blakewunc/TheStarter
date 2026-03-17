import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'The Starter — Golf Trip Planner for Your Crew',
  description: 'Plan your golf trip with the boys. Tee times, scorecards, expense splitting, group availability, and full itineraries — everything your golf crew needs in one place.',
  keywords: ['golf trip planner', 'golf group planner', 'tee time planner', 'golf scorecard app', 'golf trip organizer', 'golf vacation planner'],
  openGraph: {
    title: 'The Starter — Golf Trip Planner for Your Crew',
    description: 'Tee times, scorecards, and expense splitting for your golf crew. Plan your next trip in minutes.',
    type: 'website',
    siteName: 'The Starter',
  },
  twitter: {
    card: 'summary',
    title: 'The Starter — Golf Trip Planner',
    description: 'Tee times, scorecards, and expense splitting for your golf crew.',
  },
}

const TeeTimeIcon = () => (
  <svg className="h-7 w-7 text-[#8ECC7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TrophyIcon = () => (
  <svg className="h-7 w-7 text-[#8ECC7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
)

const SplitIcon = () => (
  <svg className="h-7 w-7 text-[#8ECC7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ItineraryIcon = () => (
  <svg className="h-7 w-7 text-[#8ECC7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
)

export default function StarterLanding() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0B442D] to-[#092D3D] px-4">
      <main className="mx-auto max-w-3xl text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <svg className="h-16 w-16 text-[#8ECC7A]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16 2v18M16 20c0 0-6 2-6 6h12c0-4-6-6-6-6z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 2l8 5-8 5V2z" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
          The Starter
        </h1>
        <p className="mb-4 text-xl text-[#8ECC7A]">
          Plan your next golf trip with the boys
        </p>
        <p className="mb-10 text-base text-[#B8D4C4]">
          Tee times, scorecards, expense splitting, and full itineraries — everything your crew needs in one place.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full bg-[#12733C] text-white hover:bg-[#0B442D] sm:w-auto px-10">
              Plan Your Golf Trip
            </Button>
          </Link>
          <Link href="/signup" className="text-sm text-[#8ECC7A] underline-offset-2 hover:underline">
            or create an account
          </Link>
        </div>
        <p className="mt-3 text-xs text-[#5A7A6B]">Free to get started — no credit card required</p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10">
            <div className="mb-3 flex justify-center">
              <TeeTimeIcon />
            </div>
            <h3 className="mb-2 font-semibold text-white">Tee Times</h3>
            <p className="text-sm text-[#B8D4C4]">
              Schedule rounds, assign foursomes, and keep everyone on the same tee sheet
            </p>
          </div>
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10">
            <div className="mb-3 flex justify-center">
              <TrophyIcon />
            </div>
            <h3 className="mb-2 font-semibold text-white">Leaderboard</h3>
            <p className="text-sm text-[#B8D4C4]">
              Track scores, handicaps, and see who's buying drinks at the 19th hole
            </p>
          </div>
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10">
            <div className="mb-3 flex justify-center">
              <SplitIcon />
            </div>
            <h3 className="mb-2 font-semibold text-white">Expense Splitting</h3>
            <p className="text-sm text-[#B8D4C4]">
              Split green fees, lodging, and dinner bills — no more awkward Venmo requests
            </p>
          </div>
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10">
            <div className="mb-3 flex justify-center">
              <ItineraryIcon />
            </div>
            <h3 className="mb-2 font-semibold text-white">Full Itinerary</h3>
            <p className="text-sm text-[#B8D4C4]">
              Plan every day from morning rounds to dinner reservations
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
