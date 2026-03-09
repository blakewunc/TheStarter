import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BackNineLanding() {
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
          The Back Nine
        </h1>
        <p className="mb-8 text-xl text-[#8ECC7A]">
          Plan your next golf trip with the boys
        </p>
        <p className="mb-12 text-lg text-[#B8D4C4]">
          Tee times, scorecards, expense splitting, and full itineraries.
          Everything your golf crew needs in one place — no group chat chaos.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full bg-[#12733C] text-white hover:bg-[#0B442D] sm:w-auto">
              Plan Your Golf Trip
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="w-full border-[#B8D4C4] text-[#B8D4C4] hover:bg-white/10 hover:text-white sm:w-auto">
              Sign Up Free
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-3 text-3xl">&#x26F3;</div>
            <h3 className="mb-2 font-semibold text-white">
              Tee Times
            </h3>
            <p className="text-sm text-[#B8D4C4]">
              Schedule rounds, assign foursomes, and keep everyone on the same tee sheet
            </p>
          </div>
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-3 text-3xl">&#x1F3C6;</div>
            <h3 className="mb-2 font-semibold text-white">
              Leaderboard
            </h3>
            <p className="text-sm text-[#B8D4C4]">
              Track scores, handicaps, and see who's buying drinks at the 19th hole
            </p>
          </div>
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-3 text-3xl">&#x1F4B0;</div>
            <h3 className="mb-2 font-semibold text-white">
              Expense Splitting
            </h3>
            <p className="text-sm text-[#B8D4C4]">
              Split green fees, lodging, and dinner bills — no more awkward Venmo requests
            </p>
          </div>
          <div className="rounded-[5px] border border-[#B8D4C4]/20 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-3 text-3xl">&#x1F4CB;</div>
            <h3 className="mb-2 font-semibold text-white">
              Full Itinerary
            </h3>
            <p className="text-sm text-[#B8D4C4]">
              Plan every day from morning rounds to dinner reservations
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
