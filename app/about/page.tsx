'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function About() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    const updateCartCount = () => {
      const stored = localStorage.getItem('snapd-cart')
      if (stored) {
        try {
          const items = JSON.parse(stored)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCartCount(items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0))
        } catch (e) {}
      } else {
        setCartCount(0)
      }
    }
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cart-updated', updateCartCount)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cart-updated', updateCartCount)
    }
  }, [])

  return (
    <>
      <style>{`
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* Nav */
        nav {
          display: flex;
          justify-content: space-between;
          padding: 32px 64px;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        
        .nav-logo {
          font-family: var(--font-serif);
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .nav-center {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .nav-link {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: opacity 0.2s;
        }

        .nav-link:hover, .nav-link.active { opacity: 0.5; }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-account-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 6px;
          border-radius: 100px;
          border: 1px solid var(--border);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: border-color 0.2s;
        }
        .nav-account-btn:hover { border-color: var(--fg); }

        .nab-initial {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: var(--fg);
          color: var(--bg);
          display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 11px;
        }

        .nav-cart {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .nav-cart:hover { border-color: var(--border); }
        .nav-cart svg { width: 18px; height: 18px; stroke: var(--fg); }
        .cart-count {
          position: absolute;
          top: -2px; right: -2px;
          background: var(--fg);
          color: var(--bg);
          font-size: 9px; font-weight: 700;
          width: 16px; height: 16px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }

        /* Buttons */
        .btn-filled {
          background: #FFFFFF;
          color: #0A0A0A;
          border: none;
          padding: 16px 36px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-filled:hover { opacity: 0.8; }

        /* General Typography Components */
        .section-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--teal);
          margin-bottom: 24px;
        }

        .editorial-title {
          font-family: var(--font-serif);
          font-size: clamp(48px, 6vw, 84px);
          line-height: 1;
          letter-spacing: -1px;
        }
        
        .editorial-title em { font-style: italic; }

        /* Hero */
        .hero {
          padding: 200px 64px 120px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .hero-sub {
          font-size: 18px;
          color: var(--muted);
          max-width: 600px;
          line-height: 1.6;
          margin-top: 32px;
        }

        /* Mission / Vision */
        .mission-section {
          padding: 80px 64px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          background: #111111;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .mission-block {
          max-width: 500px;
        }

        .mission-title {
          font-family: var(--font-serif);
          font-size: 40px;
          line-height: 1.1;
          margin-bottom: 32px;
        }

        .mission-text {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.8;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Stats Row */
        .stats-section {
          padding: 120px 64px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-num {
          font-family: var(--font-serif);
          font-size: 64px;
          line-height: 1;
        }

        .stat-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.5;
          max-width: 240px;
        }

        /* Science */
        .science-section {
          padding: 120px 64px;
          background: #111111;
          border-top: 1px solid var(--border);
        }

        .science-header {
          max-width: 600px;
          margin-bottom: 80px;
        }

        .science-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
        }

        .science-card {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .science-num {
          font-family: var(--font-serif);
          font-size: 48px;
          color: var(--teal);
        }

        .science-title {
          font-family: var(--font-serif);
          font-size: 28px;
          line-height: 1.1;
        }

        .science-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* Founders */
        .founders-section {
          padding: 120px 64px;
        }

        .founders-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .founders-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 64px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .founder-card {
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }

        .founder-name {
          font-family: var(--font-serif);
          font-size: 32px;
          margin-bottom: 8px;
        }

        .founder-role {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--teal);
          margin-bottom: 32px;
        }

        .founder-quote {
          font-family: var(--font-serif);
          font-size: 24px;
          font-style: italic;
          line-height: 1.4;
          margin-bottom: 32px;
        }

        .founder-bio {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* CTA */
        .cta-section {
          padding: 160px 64px;
          text-align: center;
          background: #111111;
          border-top: 1px solid var(--border);
        }

        .cta-title {
          font-family: var(--font-serif);
          font-size: 64px;
          margin-bottom: 24px;
        }

        .cta-sub {
          font-size: 16px;
          color: var(--muted);
          margin-bottom: 48px;
        }

        /* Footer */
        footer {
          padding: 64px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 900px) {
          .mission-section { grid-template-columns: 1fr; }
          .stats-section { grid-template-columns: repeat(2, 1fr); }
          .science-grid { grid-template-columns: 1fr; }
          .founders-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      
      <div className="page-container">
        <nav>
          <a href="/" className="nav-logo">Snapd</a>
          <div className="nav-center">
            <a href="/shop" className="nav-link">Shop</a>
            <a href="/about" className="nav-link active">About</a>
          </div>
          <div className="nav-right">
            {user ? (
              <a href="/account" className="nav-account-btn">
                <div className="nab-initial">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
                <span>Account</span>
              </a>
            ) : (
              <a href="/login" className="nav-link">Sign In</a>
            )}
            <a href="/cart" className="nav-cart" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <div className="cart-count">{cartCount}</div>}
            </a>
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section className="hero">
            <div className="section-label">Our Story</div>
            <h1 className="editorial-title">We built the alertness we <em>actually needed.</em></h1>
            <p className="hero-sub">Drowsiness costs lives, careers, and billions of dollars every year. We decided to fix it with science — not stimulants.</p>
          </section>

          {/* Mission / Vision */}
          <section className="mission-section">
            <div className="mission-block">
              <div className="section-label">Our Mission</div>
              <h2 className="mission-title">Make instant alertness available to everyone.</h2>
              <div className="mission-text">
                <p>Drowsy driving kills over 6,000 people in the US every year. Students fall asleep in exams. Night shift workers lose focus at the worst possible moments. The problem is universal — and the existing solutions are slow, impractical, and full of side effects.</p>
                <p>We built Snapd because we believe alertness shouldn&apos;t require a 15-minute wait or a caffeine crash. It should be instant, clean, and fit in your pocket.</p>
              </div>
            </div>
            
            <div className="mission-block">
              <div className="section-label">Our Vision</div>
              <h2 className="mission-title">A world where fatigue never costs a life.</h2>
              <div className="mission-text">
                <p>We see a future where a drowsy driver pulls over, takes one inhale, and drives home safely. Where a nurse finishing a 12-hour shift stays sharp for her final hour. Where a student writes her best exam, not her most exhausted one.</p>
                <p>Snapd is the first product in that future — and we&apos;re just getting started.</p>
              </div>
            </div>
          </section>

          {/* Stats Row */}
          <section className="stats-section">
            <div className="stat-item">
              <div className="stat-num">6k+</div>
              <div className="stat-desc">Drowsy driving deaths per year in the US alone</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">35%</div>
              <div className="stat-desc">Of American adults chronically sleep-deprived</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">$411B</div>
              <div className="stat-desc">Lost annually in the US from workplace fatigue</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">45m</div>
              <div className="stat-desc">Wait for caffeine to kick in. Snapd takes 3 seconds.</div>
            </div>
          </section>

          {/* Science */}
          <section className="science-section">
            <div className="science-header">
              <div className="section-label">The Science</div>
              <h2 className="editorial-title" style={{ fontSize: '56px' }}>Documented<br/><em>neuroscience.</em></h2>
            </div>
            
            <div className="science-grid">
              <div className="science-card">
                <div className="science-num">01</div>
                <h3 className="science-title">TRPM8 Activation</h3>
                <p className="science-desc">Menthol, camphor, and eucalyptol bind to TRPM8 cold-receptor proteins in your nasal mucosa — the same receptors that detect real cold temperatures. This happens instantly.</p>
              </div>
              <div className="science-card">
                <div className="science-num">02</div>
                <h3 className="science-title">Olfactory Signal</h3>
                <p className="science-desc">Cranial Nerve I carries the signal directly to the brain, bypassing the blood-brain barrier entirely. This is why smell is the fastest of all senses. No digestion or delay.</p>
              </div>
              <div className="science-card">
                <div className="science-num">03</div>
                <h3 className="science-title">Norepinephrine</h3>
                <p className="science-desc">The signal reaches the locus coeruleus — your brain&apos;s primary alertness center — triggering norepinephrine release. Sharper focus and faster reaction time under 3 seconds.</p>
              </div>
            </div>
          </section>

          {/* Founders */}
          <section className="founders-section">
            <div className="founders-header">
              <div className="section-label">The Team</div>
              <h2 className="editorial-title" style={{ textAlign: 'center' }}>Refusing to <em>accept tired.</em></h2>
            </div>
            
            <div className="founders-grid">
              <div className="founder-card">
                <h3 className="founder-name">Founder Name</h3>
                <div className="founder-role">CEO & Co-Founder</div>
                <p className="founder-quote">&quot;I almost fell asleep driving home from work one night. I started researching why nothing on the market worked fast enough — and that became Snapd.&quot;</p>
                <div className="founder-bio">Placeholder background. Previously built and exited a consumer health brand. Obsessed with the intersection of neuroscience and everyday life.</div>
              </div>
              <div className="founder-card">
                <h3 className="founder-name">Founder Name</h3>
                <div className="founder-role">CTO & Co-Founder</div>
                <p className="founder-quote">&quot;I spent years studying aromatic compounds. When I heard the idea for Snapd I knew exactly which receptors to target. The science was already there.&quot;</p>
                <div className="founder-bio">Placeholder background. Formulation chemist with deep expertise in essential oil delivery systems and aromatic receptor science.</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="cta-section">
            <h2 className="cta-title">Ready to stay <em>sharp?</em></h2>
            <p className="cta-sub">Join thousands who&apos;ve switched to instant, stimulant-free alertness.</p>
            <a href="/shop" className="btn-filled">Shop Snapd</a>
          </section>
        </main>

        <footer>
          <div>Snapd © 2026. Precision alertness.</div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      </div>
    </>
  )
}
