import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { BrandProvider } from "@/lib/BrandProvider";
import { getBrandFromHeader } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const brandId = headersList.get("x-brand");
  const isBackNine = brandId === "backNine";

  const title = isBackNine
    ? "The Back Nine - Plan Your Golf Trip"
    : "GroupTrip - Plan Group Adventures Together";
  const description = isBackNine
    ? "Plan golf trips with your crew. Tee times, scorecards, expense splitting, and itineraries — all in one place."
    : "Collaborative trip planning for bachelor parties, bachelorette parties, golf trips, and ski trips. Share itineraries, split costs, coordinate equipment, and keep everyone on the same page.";
  const siteName = isBackNine ? "The Back Nine" : "GroupTrip";

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: isBackNine
      ? ["golf trip planner", "golf trip", "tee times", "golf scorecard", "golf trip organizer", "group golf"]
      : ["trip planning", "group travel", "bachelor party planning", "bachelorette party", "golf trip planner", "ski trip organizer", "collaborative itinerary", "expense splitting", "travel coordination"],
    authors: [{ name: siteName }],
    creator: siteName,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      title,
      description,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const brandId = headersList.get("x-brand");
  const brand = getBrandFromHeader(brandId);

  return (
    <html lang="en" data-brand={brand.id === "backNine" ? "backNine" : undefined}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-1500136289047835" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BrandProvider brand={brand}>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </BrandProvider>
      </body>
    </html>
  );
}
