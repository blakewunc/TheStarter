import Link from "next/link"
import { Button } from "@/components/ui/button"

const CalendarIcon = () => (
  <svg className="h-7 w-7 text-[#70798C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const SplitIcon = () => (
  <svg className="h-7 w-7 text-[#70798C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const LinkIcon = () => (
  <svg className="h-7 w-7 text-[#70798C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
)

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F5F1ED] to-[#E8E3DD] px-4">
      <main className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#252323] sm:text-6xl">
          GroupTrip
        </h1>
        <p className="mb-4 text-xl text-[#A99985]">
          Plan unforgettable group adventures with ease
        </p>
        <p className="mb-10 text-base text-[#252323]">
          One place for itineraries, expenses, and RSVPs — no group chat chaos.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto px-10">
              Get Started
            </Button>
          </Link>
          <Link href="/signup" className="text-sm text-[#70798C] underline-offset-2 hover:underline">
            or create an account
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-[5px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            <div className="mb-3 flex justify-center">
              <CalendarIcon />
            </div>
            <h3 className="mb-2 font-semibold text-[#252323]">
              Shared Itineraries
            </h3>
            <p className="text-sm text-[#A99985]">
              Build day-by-day plans together with real-time collaboration
            </p>
          </div>
          <div className="rounded-[5px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            <div className="mb-3 flex justify-center">
              <SplitIcon />
            </div>
            <h3 className="mb-2 font-semibold text-[#252323]">
              Budget Splitting
            </h3>
            <p className="text-sm text-[#A99985]">
              Transparent cost breakdown with automatic per-person calculations
            </p>
          </div>
          <div className="rounded-[5px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            <div className="mb-3 flex justify-center">
              <LinkIcon />
            </div>
            <h3 className="mb-2 font-semibold text-[#252323]">
              Shareable Links
            </h3>
            <p className="text-sm text-[#A99985]">
              Invite friends with a simple link — no app download required
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
