import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | The Starter',
  description: 'How The Starter collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#1C1A17]">Privacy Policy</h1>
        <p className="mb-10 text-sm text-[#6B6460]">Last updated: March 17, 2025</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#1C1A17]">

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">1. Who We Are</h2>
            <p>The Starter ("we," "our," or "us") is a golf trip planning application. We help groups organize golf trips including tee times, scorecards, expense splitting, and itineraries. Our service is available at thestarter.app.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">2. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly to us when you create an account or use our service:</p>
            <ul className="ml-4 list-disc space-y-1 text-[#6B6460]">
              <li><span className="text-[#1C1A17]">Account information</span> — your email address and display name when you sign up</li>
              <li><span className="text-[#1C1A17]">Trip data</span> — trip names, destinations, dates, itinerary items, tee times, golf scores, and budget information you enter</li>
              <li><span className="text-[#1C1A17]">Usage data</span> — pages visited, features used, and time spent in the app (collected automatically)</li>
              <li><span className="text-[#1C1A17]">Device information</span> — browser type, operating system, and IP address (collected automatically)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="ml-4 list-disc space-y-1 text-[#6B6460]">
              <li>Provide, maintain, and improve our trip planning service</li>
              <li>Send you account-related communications (confirmation emails, password resets)</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns to improve the product</li>
              <li>Detect and prevent fraudulent or abusive activity</li>
            </ul>
            <p className="mt-3 text-[#6B6460]">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">4. Information Sharing</h2>
            <p className="mb-3">We share your information only in these limited circumstances:</p>
            <ul className="ml-4 list-disc space-y-1 text-[#6B6460]">
              <li><span className="text-[#1C1A17]">With trip members</span> — other members of your trips can see your display name and trip-related activity</li>
              <li><span className="text-[#1C1A17]">Service providers</span> — we use Supabase for database hosting and authentication. They process data on our behalf under confidentiality agreements</li>
              <li><span className="text-[#1C1A17]">Legal requirements</span> — if required by law, court order, or government request</li>
              <li><span className="text-[#1C1A17]">Business transfers</span> — in connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">5. Cookies and Tracking</h2>
            <p className="mb-3">We use cookies and similar technologies to:</p>
            <ul className="ml-4 list-disc space-y-1 text-[#6B6460]">
              <li>Keep you logged in to your account (authentication cookies)</li>
              <li>Understand how visitors use our site (analytics)</li>
              <li>Display advertisements relevant to golf travel (advertising cookies, Back Nine brand only)</li>
            </ul>
            <p className="mt-3 text-[#6B6460]">You can disable cookies in your browser settings, though this may affect your ability to log in and use certain features.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">6. Data Retention</h2>
            <p>We retain your account information and trip data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal purposes.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="ml-4 list-disc space-y-1 text-[#6B6460]">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your account and associated data</li>
              <li>Export your trip data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
            <p className="mt-3">To exercise these rights, email us at <a href="mailto:hello@thestarter.app" className="text-[#4A7C59] underline-offset-2 hover:underline">hello@thestarter.app</a>.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">8. Security</h2>
            <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), row-level security on our database, and secure authentication. No method of transmission over the internet is 100% secure, but we take reasonable precautions to protect your information.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">9. Children's Privacy</h2>
            <p>Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website or emailing registered users. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[#1C1A17]">11. Contact Us</h2>
            <p>For questions about this Privacy Policy or to make a privacy request, contact us at:</p>
            <div className="mt-3 rounded-[5px] border border-[#DAD2BC] bg-white p-4">
              <p className="font-medium text-[#1C1A17]">The Starter</p>
              <p className="text-[#6B6460]">Email: <a href="mailto:hello@thestarter.app" className="text-[#4A7C59] underline-offset-2 hover:underline">hello@thestarter.app</a></p>
              <p className="text-[#6B6460]">Website: thestarter.app</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
