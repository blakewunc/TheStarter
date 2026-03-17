import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | The Starter',
  description: 'Get in touch with The Starter team. We\'d love to hear from you.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#70798C]">Contact</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#252323]">Get in Touch</h1>
        <p className="mb-10 text-[#A99985]">
          Questions, feedback, partnership inquiries — we read everything.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <a
            href="mailto:hello@thestarter.app"
            className="group rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#4A7C59]/10">
              <svg className="h-5 w-5 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="mb-1 font-semibold text-[#252323] group-hover:text-[#4A7C59] transition-colors">Email Us</h2>
            <p className="mb-3 text-sm text-[#A99985]">For general questions, feedback, or support.</p>
            <p className="text-sm font-medium text-[#4A7C59]">hello@thestarter.app</p>
          </a>

          <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#70798C]/10">
              <svg className="h-5 w-5 text-[#70798C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
            </div>
            <h2 className="mb-1 font-semibold text-[#252323]">Response Time</h2>
            <p className="mb-3 text-sm text-[#A99985]">We typically respond within 1–2 business days.</p>
            <p className="text-sm text-[#A99985]">For urgent issues with an active trip, mention it in your subject line and we'll prioritize.</p>
          </div>
        </div>

        <div className="mt-8 rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 font-semibold text-[#252323]">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Is The Starter free to use?',
                a: 'Yes — creating trips, inviting players, and using all core features is free.',
              },
              {
                q: 'Can I use The Starter for non-golf trips?',
                a: 'The Starter is purpose-built for golf trips. For general group travel, check out GroupTrip.',
              },
              {
                q: 'How do I report a bug?',
                a: 'Email hello@thestarter.app with a description of the issue and we\'ll look into it.',
              },
              {
                q: 'I want to advertise on The Starter. How?',
                a: 'Email us at hello@thestarter.app with "Advertising" in the subject line.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-[#F5F1ED] pb-4 last:border-0 last:pb-0">
                <p className="mb-1 font-medium text-[#252323]">{q}</p>
                <p className="text-sm text-[#A99985]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
