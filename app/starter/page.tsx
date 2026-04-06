'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function StarterLanding() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const heroImg = document.getElementById('hero-img')
    if (heroImg) heroImg.classList.add('loaded')
  }, [])

  useEffect(() => {
    const revealEls = document.querySelectorAll('.sl-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    )
    revealEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .sl-root {
          --cream: #F5F1ED;
          --ink: #1C1A17;
          --muted: #6B6460;
          --accent: #70798C;
          --border: rgba(28,26,23,0.12);
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
          background: var(--cream);
          color: var(--ink);
          font-family: var(--sans);
          font-size: 16px;
          line-height: 1.7;
          -webkit-font-smoothing: antialiased;
        }
        .sl-root img { display: block; width: 100%; object-fit: cover; }
        .sl-root a { color: inherit; text-decoration: none; }

        /* NAV */
        .sl-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px;
          transition: background 0.4s ease, border-bottom 0.4s ease;
        }
        .sl-nav.scrolled {
          background: rgba(245,241,237,0.94);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .sl-nav-logo {
          font-family: var(--serif);
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: var(--cream);
          transition: color 0.4s;
        }
        .sl-nav.scrolled .sl-nav-logo { color: var(--ink); }
        .sl-nav-links {
          display: flex; align-items: center; gap: 36px;
          list-style: none; margin: 0; padding: 0;
        }
        .sl-nav-links a {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(245,241,237,0.8);
          transition: color 0.3s;
        }
        .sl-nav.scrolled .sl-nav-links a { color: var(--muted); }
        .sl-nav-links a:hover { color: var(--cream); }
        .sl-nav.scrolled .sl-nav-links a:hover { color: var(--ink); }
        .sl-nav-cta {
          font-size: 13px !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
          color: var(--ink) !important;
          background: var(--cream);
          padding: 10px 24px;
          border-radius: 2px;
          transition: background 0.3s, color 0.3s !important;
        }
        .sl-nav.scrolled .sl-nav-cta {
          background: var(--ink);
          color: var(--cream) !important;
        }
        .sl-nav-cta:hover { opacity: 0.88; }

        /* HERO */
        .sl-hero {
          position: relative;
          height: 100vh;
          min-height: 680px;
          display: flex; align-items: flex-end;
          overflow: hidden;
          padding: 0;
        }
        .sl-hero-img {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1800&q=80');
          background-size: cover;
          background-position: center 30%;
          transform: scale(1.04);
          transition: transform 8s ease-out;
        }
        .sl-hero-img.loaded { transform: scale(1); }
        .sl-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(28,26,23,0.72) 0%, rgba(28,26,23,0.28) 55%, transparent 100%);
        }
        .sl-hero-content {
          position: relative; z-index: 2;
          padding: 0 48px 72px;
          max-width: 760px;
          opacity: 0;
          transform: translateY(24px);
          animation: sl-fadeUp 1s 0.4s ease forwards;
        }
        .sl-hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(245,241,237,0.65);
          margin-bottom: 20px;
        }
        .sl-hero-headline {
          font-family: var(--serif);
          font-size: clamp(52px, 7vw, 88px);
          font-weight: 300;
          line-height: 1.0;
          color: var(--cream);
          letter-spacing: -0.01em;
          margin-bottom: 24px;
        }
        .sl-hero-headline em { font-style: italic; font-weight: 300; }
        .sl-hero-sub {
          font-size: 17px;
          font-weight: 300;
          color: rgba(245,241,237,0.82);
          margin-bottom: 40px;
          max-width: 440px;
          line-height: 1.6;
        }
        .sl-hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .sl-hero-meta {
          position: absolute; bottom: 32px; right: 48px; z-index: 2;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(245,241,237,0.45);
        }

        /* BUTTONS */
        .sl-btn-primary {
          display: inline-block;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: var(--cream);
          color: var(--ink);
          padding: 15px 36px;
          border-radius: 2px;
          transition: opacity 0.25s;
          font-weight: 500;
        }
        .sl-btn-primary:hover { opacity: 0.88; }
        .sl-btn-ghost {
          display: inline-block;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid rgba(245,241,237,0.45);
          color: var(--cream) !important;
          padding: 15px 36px;
          border-radius: 2px;
          transition: border-color 0.25s, background 0.25s;
          font-weight: 400;
        }
        .sl-btn-ghost:hover {
          border-color: var(--cream);
          background: rgba(245,241,237,0.08);
        }

        /* SCROLL REVEAL */
        .sl-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .sl-reveal.visible { opacity: 1; transform: translateY(0); }
        .sl-reveal-d1 { transition-delay: 0.1s; }
        .sl-reveal-d2 { transition-delay: 0.22s; }
        .sl-reveal-d3 { transition-delay: 0.34s; }
        .sl-reveal-d4 { transition-delay: 0.46s; }

        /* SECTIONS */
        .sl-section { padding: 100px 48px; }
        .sl-eyebrow {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 18px;
        }
        .sl-headline {
          font-family: var(--serif);
          font-size: clamp(34px, 4vw, 52px);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: var(--ink);
        }
        .sl-headline em { font-style: italic; }

        /* WHY */
        .sl-why {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
        }
        .sl-why-img {
          position: relative;
          height: 580px;
          overflow: hidden;
          border-radius: 2px;
        }
        .sl-why-img img {
          height: 100%;
          object-position: center;
          transition: transform 0.8s ease;
        }
        .sl-why-img:hover img { transform: scale(1.03); }
        .sl-why-body {
          font-family: var(--serif);
          font-size: 22px;
          font-weight: 300;
          line-height: 1.65;
          color: var(--ink);
          margin: 28px 0 36px;
        }
        .sl-why-quote {
          border-left: 1px solid var(--accent);
          padding-left: 24px;
          font-family: var(--serif);
          font-size: 17px;
          font-style: italic;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          margin-top: 36px;
        }

        /* HOW */
        .sl-how { background: var(--ink); color: var(--cream); }
        .sl-how-inner { max-width: 1280px; margin: 0 auto; }
        .sl-how .sl-headline { color: var(--cream); }
        .sl-how .sl-eyebrow { color: rgba(245,241,237,0.4); }
        .sl-how-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 72px;
          gap: 40px;
        }
        .sl-how-header-right {
          font-size: 15px;
          font-weight: 300;
          color: rgba(245,241,237,0.6);
          max-width: 320px;
          text-align: right;
          line-height: 1.6;
        }
        .sl-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .sl-step {
          position: relative;
          background: rgba(245,241,237,0.03);
          padding: 52px 40px;
          border: 1px solid rgba(245,241,237,0.07);
          transition: background 0.35s;
          overflow: hidden;
        }
        .sl-step:hover { background: rgba(245,241,237,0.06); }
        .sl-step-img {
          height: 260px;
          margin: -52px -40px 40px;
          overflow: hidden;
        }
        .sl-step-img img {
          height: 100%;
          transition: transform 0.6s ease;
        }
        .sl-step:hover .sl-step-img img { transform: scale(1.04); }
        .sl-step-num {
          font-family: var(--serif);
          font-size: 72px;
          font-weight: 300;
          color: rgba(245,241,237,0.08);
          line-height: 1;
          position: absolute;
          top: 280px; right: 32px;
          user-select: none;
        }
        .sl-step-label {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(245,241,237,0.35);
          margin-bottom: 14px;
        }
        .sl-step-title {
          font-family: var(--serif);
          font-size: 26px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 14px;
          line-height: 1.2;
        }
        .sl-step-body {
          font-size: 14px;
          font-weight: 300;
          color: rgba(245,241,237,0.58);
          line-height: 1.7;
        }
        .sl-step-link {
          display: inline-block;
          margin-top: 24px;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cream);
          border-bottom: 1px solid rgba(245,241,237,0.25);
          padding-bottom: 2px;
          transition: border-color 0.25s;
        }
        .sl-step-link:hover { border-color: var(--cream); }

        /* TRIPS */
        .sl-trips { max-width: 1280px; margin: 0 auto; }
        .sl-trips-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 56px;
        }
        .sl-trips-link {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          border-bottom: 1px solid transparent;
          padding-bottom: 2px;
          transition: border-color 0.25s;
        }
        .sl-trips-link:hover { border-color: var(--accent); }
        .sl-trips-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .sl-trip-card {
          position: relative;
          overflow: hidden;
          border-radius: 2px;
          cursor: pointer;
          background: #E8E3DC;
        }
        .sl-trip-card:first-child { grid-column: span 2; }
        .sl-trip-img {
          height: 420px;
          overflow: hidden;
          position: relative;
        }
        .sl-trip-card:first-child .sl-trip-img { height: 520px; }
        .sl-trip-img img {
          height: 100%;
          transition: transform 0.7s ease;
        }
        .sl-trip-card:hover .sl-trip-img img { transform: scale(1.05); }
        .sl-trip-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(28,26,23,0.75) 0%, transparent 55%);
        }
        .sl-trip-info {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 32px;
          color: var(--cream);
        }
        .sl-trip-tag {
          display: inline-block;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: rgba(245,241,237,0.15);
          border: 1px solid rgba(245,241,237,0.25);
          color: var(--cream);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }
        .sl-trip-name {
          font-family: var(--serif);
          font-size: 28px;
          font-weight: 300;
          line-height: 1.15;
          margin-bottom: 6px;
        }
        .sl-trip-card:first-child .sl-trip-name { font-size: 38px; }
        .sl-trip-meta {
          font-size: 13px;
          font-weight: 300;
          color: rgba(245,241,237,0.65);
          letter-spacing: 0.03em;
        }
        .sl-trip-cta {
          display: inline-block;
          margin-top: 16px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cream);
          border: 1px solid rgba(245,241,237,0.4);
          padding: 8px 20px;
          border-radius: 2px;
          transition: background 0.25s, border-color 0.25s;
        }
        .sl-trip-card:hover .sl-trip-cta {
          background: rgba(245,241,237,0.15);
          border-color: var(--cream);
        }

        /* FEATURES */
        .sl-features { background: #EDECE6; }
        .sl-features-inner { max-width: 1280px; margin: 0 auto; }
        .sl-features-header { margin-bottom: 72px; }
        .sl-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          border: 1px solid var(--border);
        }
        .sl-feature {
          background: var(--cream);
          padding: 48px 36px;
          border: 1px solid var(--border);
          transition: background 0.3s;
        }
        .sl-feature:hover { background: #F9F6F2; }
        .sl-feature-icon {
          width: 40px; height: 40px;
          border: 1px solid var(--border);
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
        }
        .sl-feature-icon svg { width: 18px; height: 18px; stroke: var(--accent); fill: none; stroke-width: 1.5; }
        .sl-feature-name {
          font-family: var(--serif);
          font-size: 21px;
          font-weight: 400;
          color: var(--ink);
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .sl-feature-desc {
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }

        /* TESTIMONIALS */
        .sl-testimonials { max-width: 1280px; margin: 0 auto; }
        .sl-testimonials-header { margin-bottom: 64px; }
        .sl-reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .sl-review {
          background: #EDECE6;
          padding: 44px 40px;
          border-radius: 2px;
          border: 1px solid var(--border);
          transition: border-color 0.3s;
        }
        .sl-review:hover { border-color: rgba(28,26,23,0.22); }
        .sl-review-stars { display: flex; gap: 3px; margin-bottom: 24px; }
        .sl-star { width: 12px; height: 12px; fill: #B5A98A; }
        .sl-review-text {
          font-family: var(--serif);
          font-size: 18px;
          font-weight: 300;
          font-style: italic;
          line-height: 1.65;
          color: var(--ink);
          margin-bottom: 28px;
        }
        .sl-review-attribution {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .sl-review-trip { font-size: 12px; color: var(--accent); letter-spacing: 0.06em; }

        /* CTA BANNER */
        .sl-cta-banner {
          position: relative;
          height: 580px;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        .sl-cta-banner-img {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600&q=80');
          background-size: cover;
          background-position: center 40%;
          background-attachment: fixed;
        }
        .sl-cta-banner-overlay {
          position: absolute; inset: 0;
          background: rgba(28,26,23,0.58);
        }
        .sl-cta-banner-content {
          position: relative; z-index: 2;
          max-width: 600px;
          padding: 0 32px;
        }
        .sl-cta-banner-headline {
          font-family: var(--serif);
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 300;
          color: var(--cream);
          line-height: 1.1;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }
        .sl-cta-banner-sub {
          font-size: 15px;
          font-weight: 300;
          color: rgba(245,241,237,0.72);
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .sl-cta-banner-actions { display: flex; gap: 16px; justify-content: center; }

        /* FOOTER */
        .sl-footer {
          background: var(--ink);
          color: rgba(245,241,237,0.5);
          padding: 60px 48px 40px;
        }
        .sl-footer-inner { max-width: 1280px; margin: 0 auto; }
        .sl-footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(245,241,237,0.08);
          margin-bottom: 36px;
          gap: 40px;
        }
        .sl-footer-brand {
          font-family: var(--serif);
          font-size: 24px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 10px;
        }
        .sl-footer-tagline {
          font-size: 13px;
          color: rgba(245,241,237,0.38);
          font-style: italic;
          font-family: var(--serif);
        }
        .sl-footer-links-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(245,241,237,0.3);
          margin-bottom: 16px;
        }
        .sl-footer-links {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 10px;
        }
        .sl-footer-links a {
          font-size: 14px;
          font-weight: 300;
          color: rgba(245,241,237,0.55);
          transition: color 0.2s;
        }
        .sl-footer-links a:hover { color: var(--cream); }
        .sl-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: rgba(245,241,237,0.28);
        }
        .sl-footer-by { font-size: 12px; color: rgba(245,241,237,0.22); }
        .sl-footer-by a { color: rgba(245,241,237,0.38); transition: color 0.2s; }
        .sl-footer-by a:hover { color: rgba(245,241,237,0.65); }

        /* ANIMATION */
        @keyframes sl-fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .sl-nav { padding: 16px 24px; }
          .sl-nav-links { display: none; }
          .sl-section { padding: 72px 24px; }
          .sl-hero-content { padding: 0 24px 56px; }
          .sl-hero-meta { display: none; }
          .sl-why { grid-template-columns: 1fr; gap: 48px; }
          .sl-why-img { height: 380px; }
          .sl-steps { grid-template-columns: 1fr; gap: 2px; }
          .sl-trips-grid { grid-template-columns: 1fr; }
          .sl-trip-card:first-child { grid-column: span 1; }
          .sl-features-grid { grid-template-columns: 1fr 1fr; }
          .sl-reviews-grid { grid-template-columns: 1fr; }
          .sl-cta-banner-img { background-attachment: scroll; }
          .sl-footer-top { flex-direction: column; gap: 36px; }
          .sl-how-header { flex-direction: column; align-items: flex-start; }
          .sl-how-header-right { text-align: left; }
        }
        @media (max-width: 600px) {
          .sl-features-grid { grid-template-columns: 1fr; }
          .sl-hero-actions { flex-direction: column; }
          .sl-hero-headline { font-size: 42px; }
          .sl-trips-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <div className="sl-root">

        {/* NAV */}
        <nav className="sl-nav" ref={navRef}>
          <Link className="sl-nav-logo" href="/starter">The Starter</Link>
          <ul className="sl-nav-links">
            <li><a href="#trips">Golf Trips</a></li>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><Link href="/signup" className="sl-nav-cta">Plan Your Trip</Link></li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="sl-hero">
          <div className="sl-hero-img" id="hero-img" />
          <div className="sl-hero-overlay" />
          <div className="sl-hero-content">
            <p className="sl-hero-eyebrow">The Starter by GroupTrip</p>
            <h1 className="sl-hero-headline">Golf trips,<br /><em>handled.</em></h1>
            <p className="sl-hero-sub">You book the tee times. We handle everything else.</p>
            <div className="sl-hero-actions">
              <Link href="/signup" className="sl-btn-primary">Get Started</Link>
              <Link href="/trips/demo" className="sl-btn-ghost">See a Demo Trip</Link>
            </div>
          </div>
          <div className="sl-hero-meta">Free to start &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Groups of 4–20</div>
        </section>

        {/* THE WHY */}
        <section className="sl-section">
          <div className="sl-why">
            <div className="sl-why-img sl-reveal">
              {/* Golfer on a beautiful sunlit fairway */}
              <img
                src="https://images.unsplash.com/photo-1592919505780-303950717480?w=900&q=80"
                alt="Golfer on a lush fairway at golden hour"
                loading="lazy"
              />
            </div>
            <div>
              <p className="sl-eyebrow sl-reveal">The Problem, Solved</p>
              <h2 className="sl-headline sl-reveal sl-reveal-d1">
                Someone always ends<br />up running the trip.<br /><em>It shouldn&apos;t be a second job.</em>
              </h2>
              <p className="sl-why-body sl-reveal sl-reveal-d2">
                Every great golf trip starts the same way: a group chat, a lot of enthusiasm,
                and one person slowly drowning in logistics. Tee time confirmations.
                Venmo requests no one answers. Handicap arguments on the first tee.
                Scorecards that get lost at the 19th hole.
              </p>
              <p className="sl-why-body sl-reveal sl-reveal-d2" style={{ marginTop: 0 }}>
                The Starter runs the operation. Costs, scorecards, bets, foursomes,
                and the 12 group texts you were about to send — all in one place,
                shared with the crew the moment you send the invite.
              </p>
              <blockquote className="sl-why-quote sl-reveal sl-reveal-d3">
                &ldquo;No more Venmo math. The Starter does it.&rdquo;
              </blockquote>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="sl-section sl-how" id="how">
          <div className="sl-how-inner">
            <div className="sl-how-header">
              <div>
                <p className="sl-eyebrow sl-reveal">How It Works</p>
                <h2 className="sl-headline sl-reveal sl-reveal-d1">Three steps.<br /><em>One less group chat.</em></h2>
              </div>
              <p className="sl-how-header-right sl-reveal sl-reveal-d2">
                From your first tee time to the final payout at the 19th hole —
                The Starter keeps everything moving.
              </p>
            </div>
            <div className="sl-steps">

              <div className="sl-step sl-reveal sl-reveal-d1">
                <div className="sl-step-img">
                  {/* Aerial island green surrounded by bunkers and water hazard */}
                  <img
                    src="https://images.unsplash.com/photo-1605144884374-ecbb643615f6?w=800&q=80"
                    alt="Aerial view of an island golf green surrounded by bunkers"
                    loading="lazy"
                  />
                </div>
                <div className="sl-step-num">01</div>
                <p className="sl-step-label">Step One</p>
                <h3 className="sl-step-title">Pick your course.<br />Build your trip.</h3>
                <p className="sl-step-body">
                  Browse curated golf packages or start from scratch. Set your dates,
                  add rounds, lodging, dinners — every expense in one place before anyone arrives.
                </p>
                <a href="#trips" className="sl-step-link">Browse trips</a>
              </div>

              <div className="sl-step sl-reveal sl-reveal-d2">
                <div className="sl-step-img">
                  {/* Golf green with white flag, pond and trees in background */}
                  <img
                    src="https://images.unsplash.com/photo-1606443192517-919653213206?w=800&q=80"
                    alt="Golf green with flag and pond, blue sky"
                    loading="lazy"
                  />
                </div>
                <div className="sl-step-num">02</div>
                <p className="sl-step-label">Step Two</p>
                <h3 className="sl-step-title">Send the invite.<br />Crew gets the details.</h3>
                <p className="sl-step-body">
                  One link. Your crew sees the full trip — foursomes, costs, schedule,
                  and their share. No app download required. No excuses for not knowing the plan.
                </p>
                <Link href="/signup" className="sl-step-link">Start planning</Link>
              </div>

              <div className="sl-step sl-reveal sl-reveal-d3">
                <div className="sl-step-img">
                  {/* Golfer celebrating a putt / 19th hole scene */}
                  <img
                    src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80"
                    alt="Golf course at sunset, celebrating a great round"
                    loading="lazy"
                  />
                </div>
                <div className="sl-step-num">03</div>
                <p className="sl-step-label">Step Three</p>
                <h3 className="sl-step-title">Play. Score. Collect.</h3>
                <p className="sl-step-body">
                  Live scoring, handicap-adjusted Nassau and skins, real-time leaderboard.
                  When the final putt drops, payouts are already calculated.
                  Just enjoy the 19th hole.
                </p>
                <Link href="/trips/demo" className="sl-step-link">See demo</Link>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURED TRIPS */}
        <section className="sl-section" id="trips">
          <div className="sl-trips">
            <div className="sl-trips-header sl-reveal">
              <div>
                <p className="sl-eyebrow">Featured Golf Trips</p>
                <h2 className="sl-headline">Curated packages.<br /><em>Unforgettable courses.</em></h2>
              </div>
              <Link href="/trips/new" className="sl-trips-link">Plan your own →</Link>
            </div>

            <div className="sl-trips-grid">

              <div className="sl-trip-card sl-reveal sl-reveal-d1">
                <div className="sl-trip-img">
                  {/* Coastal parkland course with ocean panorama */}
                  <img
                    src="https://images.unsplash.com/photo-1635328800844-0e68e80ab258?w=1200&q=80"
                    alt="Pebble Beach Golf Links overlooking the Pacific Ocean"
                    loading="lazy"
                  />
                  <div className="sl-trip-overlay" />
                </div>
                <div className="sl-trip-info">
                  <span className="sl-trip-tag">Featured · Spots Available</span>
                  <h3 className="sl-trip-name">Pebble Beach &amp;<br />Monterey Peninsula</h3>
                  <p className="sl-trip-meta">4 nights · 3 rounds · Pebble, Spyglass, Poppy Hills</p>
                  <Link href="/trips/curated/pebble-beach" className="sl-trip-cta">Plan this trip</Link>
                </div>
              </div>

              <div className="sl-trip-card sl-reveal sl-reveal-d2">
                <div className="sl-trip-img">
                  {/* Classic parkland course: bunker, fairway, blue sky */}
                  <img
                    src="https://images.unsplash.com/photo-1443706340763-4b60757a36ce?w=800&q=80"
                    alt="Pinehurst No. 2 golf course, North Carolina Sandhills"
                    loading="lazy"
                  />
                  <div className="sl-trip-overlay" />
                </div>
                <div className="sl-trip-info">
                  <span className="sl-trip-tag">Fall Classic</span>
                  <h3 className="sl-trip-name">Pinehurst<br />No. 2 &amp; Beyond</h3>
                  <p className="sl-trip-meta">3 nights · 3 rounds · NC Sandhills</p>
                  <Link href="/trips/curated/pinehurst" className="sl-trip-cta">Plan this trip</Link>
                </div>
              </div>

              <div className="sl-trip-card sl-reveal sl-reveal-d2">
                <div className="sl-trip-img">
                  {/* Links course at purple sunset, coastal cliffs in distance */}
                  <img
                    src="https://images.unsplash.com/photo-1672871583040-42826d4e9ca4?w=800&q=80"
                    alt="Scottish links golf course at sunset with coastal cliffs"
                    loading="lazy"
                  />
                  <div className="sl-trip-overlay" />
                </div>
                <div className="sl-trip-info">
                  <span className="sl-trip-tag">International · Limited</span>
                  <h3 className="sl-trip-name">Scottish Links<br />Pilgrimage</h3>
                  <p className="sl-trip-meta">7 nights · 5 rounds · St Andrews, Kingsbarns, Carnoustie + Dumbarnie</p>
                  <Link href="/trips/curated/scottish-pilgrimage" className="sl-trip-cta">Plan this trip</Link>
                </div>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '52px' }} className="sl-reveal">
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
                Planning your own trip? Build it from scratch — free to start.
              </p>
              <Link href="/trips/new" className="sl-btn-primary" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
                Plan Your Own Trip
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="sl-section sl-features" id="features">
          <div className="sl-features-inner">
            <div className="sl-features-header">
              <p className="sl-eyebrow sl-reveal">What&apos;s Included</p>
              <h2 className="sl-headline sl-reveal sl-reveal-d1" style={{ maxWidth: '560px' }}>
                Everything a golf trip<br />needs. <em>Nothing it doesn&apos;t.</em>
              </h2>
            </div>
            <div className="sl-features-grid">

              <div className="sl-feature sl-reveal sl-reveal-d1">
                <div className="sl-feature-icon">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
                </div>
                <h3 className="sl-feature-name">Tee Time Coordination</h3>
                <p className="sl-feature-desc">Schedule rounds, assign foursomes, and keep every tee time, course, and cart assignment in one shared view. No more forwarded emails.</p>
              </div>

              <div className="sl-feature sl-reveal sl-reveal-d2">
                <div className="sl-feature-icon">
                  <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </div>
                <h3 className="sl-feature-name">Live Scoring</h3>
                <p className="sl-feature-desc">Real-time scores with handicap adjustments baked in. Net, gross, and stroke play — the leaderboard updates the moment someone taps a putt.</p>
              </div>

              <div className="sl-feature sl-reveal sl-reveal-d3">
                <div className="sl-feature-icon">
                  <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <h3 className="sl-feature-name">Cost Splitting</h3>
                <p className="sl-feature-desc">Green fees, lodging, caddies, dinners, that late-night whisky — log it once. Everyone sees their share. No more Venmo math or awkward asks at checkout.</p>
              </div>

              <div className="sl-feature sl-reveal sl-reveal-d4">
                <div className="sl-feature-icon">
                  <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <h3 className="sl-feature-name">Nassau &amp; Skins</h3>
                <p className="sl-feature-desc">Set the stakes before the first tee. Track holes, carry overs, and press bets in real time. Payouts calculated automatically — no disputes at the bar.</p>
              </div>

            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sl-section">
          <div className="sl-testimonials">
            <div className="sl-testimonials-header">
              <p className="sl-eyebrow sl-reveal">What the Crew Is Saying</p>
              <h2 className="sl-headline sl-reveal sl-reveal-d1">
                They played the course.<br /><em>We ran the trip.</em>
              </h2>
            </div>
            <div className="sl-reviews-grid">

              {[
                {
                  text: '"Used The Starter for our annual Pinehurst trip. Twelve people, three rounds, split bills, and a Nassau that got out of hand on Saturday. Everything tracked perfectly. First year nobody argued about who owed what."',
                  name: '— James R.',
                  trip: 'Pinehurst, NC · Group of 12',
                  delay: 'sl-reveal-d1',
                },
                {
                  text: '"The invite link alone sold it. Sent it to the group, everyone could see the schedule, their costs, and the tee times before I had to answer a single question. That\'s new."',
                  name: '— Marcus T.',
                  trip: 'Myrtle Beach, SC · Bachelor Trip · Group of 8',
                  delay: 'sl-reveal-d2',
                },
                {
                  text: '"Scotland trip. Seven of us. Five rounds across four courses. Skins that carried over twice. The Starter tracked every pence. Lads want to use it every year now."',
                  name: '— Will F.',
                  trip: 'St Andrews, Scotland · Group of 7',
                  delay: 'sl-reveal-d3',
                },
              ].map((r) => (
                <div key={r.name} className={`sl-review sl-reveal ${r.delay}`}>
                  <div className="sl-review-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="sl-star" viewBox="0 0 12 12">
                        <polygon points="6,1 7.5,4.5 11.5,4.5 8.5,7 9.5,11 6,9 2.5,11 3.5,7 0.5,4.5 4.5,4.5" />
                      </svg>
                    ))}
                  </div>
                  <p className="sl-review-text">{r.text}</p>
                  <p className="sl-review-attribution">{r.name}</p>
                  <p className="sl-review-trip">{r.trip}</p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* BANNER CTA */}
        <div className="sl-cta-banner">
          <div className="sl-cta-banner-img" />
          <div className="sl-cta-banner-overlay" />
          <div className="sl-cta-banner-content sl-reveal">
            <h2 className="sl-cta-banner-headline">Your crew<br />is waiting.</h2>
            <p className="sl-cta-banner-sub">
              The only thing left between you and the first tee is the invite link.
            </p>
            <div className="sl-cta-banner-actions">
              <Link href="/signup" className="sl-btn-primary">Start Planning — Free</Link>
              <a href="#trips" className="sl-btn-ghost">Browse Packages</a>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="sl-footer">
          <div className="sl-footer-inner">
            <div className="sl-footer-top">
              <div>
                <p className="sl-footer-brand">The Starter</p>
                <p className="sl-footer-tagline">Golf trips, handled.</p>
              </div>
              <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
                <div>
                  <p className="sl-footer-links-label">Product</p>
                  <ul className="sl-footer-links">
                    <li><Link href="/trips">My Golf Trips</Link></li>
                    <li><Link href="/trips/new">Plan a Trip</Link></li>
                    <li><Link href="/trips/demo">Demo Trip</Link></li>
                    <li><Link href="/blog">Golf Trip Guides</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="sl-footer-links-label">Company</p>
                  <ul className="sl-footer-links">
                    <li><Link href="/about">About</Link></li>
                    <li><Link href="/contact">Contact</Link></li>
                    <li><Link href="/privacy">Privacy Policy</Link></li>
                    <li><a href="https://grouptrip-mu.vercel.app">GroupTrip</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="sl-footer-bottom">
              <span>© 2026 The Starter. All rights reserved.</span>
              <span className="sl-footer-by">A <a href="https://grouptrip-mu.vercel.app">GroupTrip</a> product</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
