import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED] p-4">
      <div className="w-full max-w-sm text-center">
        <p
          className="mb-4 text-[12px] uppercase tracking-[0.1em] text-[#6B6460]"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          The Starter
        </p>

        <h1 className="mb-4 font-serif text-[48px] font-semibold leading-tight text-[#1a1a1a]">
          You&apos;re on the tee.
        </h1>

        <p
          className="mx-auto mb-8 max-w-[380px] text-[16px] leading-relaxed text-[#3B6D11]"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Plan your trip, track your bets, settle up after the round.
          Everything your group needs in one place.
        </p>

        <Link
          href="/trips/new"
          className="mb-3 flex w-full items-center justify-center rounded-[5px] bg-[#3B6D11] px-4 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Plan a trip
        </Link>

        <Link
          href="/trips"
          className="text-[13px] text-[#6B6460] underline-offset-2 hover:underline"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Browse my trips
        </Link>
      </div>
    </div>
  )
}
