import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Starter — Golf Trip Planner for Your Crew',
  description: 'Plan your golf trip with your crew. Tee times, scorecards, expense splitting, Nassau & skins, group availability — everything your crew needs in one place.',
  keywords: ['golf trip planner', 'golf group planner', 'tee time planner', 'golf scorecard app', 'golf trip organizer', 'golf vacation planner', 'nassau skins golf', 'golf trip expense split'],
  openGraph: {
    title: 'The Starter — Golf Trip Planner for Your Crew',
    description: 'Tee times, scorecards, and expense splitting for your golf crew. Plan your next trip in minutes.',
    type: 'website',
    siteName: 'The Starter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Starter — Golf Trip Planner',
    description: 'Tee times, scorecards, and expense splitting for your golf crew.',
  },
}

export default function StarterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
