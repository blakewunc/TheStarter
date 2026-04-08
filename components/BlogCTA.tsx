import Link from 'next/link'

export function BlogCTA() {
  return (
    <div className="mt-12 rounded-[5px] border border-[#DAD2BC] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p className="mb-2 text-xl font-semibold text-[#252323]">Ready to plan your golf trip?</p>
      <p className="mb-5 text-sm text-[#A99985]">
        The Starter handles tee times, expenses, scorecards, and side bets — all in one place.
      </p>
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 rounded-[5px] bg-[#12733C] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0B442D]"
      >
        Plan Your Trip — It's Free
      </Link>
    </div>
  )
}
