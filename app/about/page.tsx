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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:       #080C14;
          --bg2:      #0D1420;
          --teal:     #0EAFD4;
          --cyan:     #3DEFF7;
          --white:    #F0F6FF;
          --muted:    #6B7A99;
          --card:     rgba(255,255,255,0.04);
          --border:   rgba(255,255,255,0.08);
        }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg);
          color: var(--white);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% -5%, rgba(14,175,212,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 90% 50%, rgba(61,239,247,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 30% 30% at 5% 80%, rgba(14,175,212,0.04) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 72px;
          background: rgba(8,12,20,0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 4px; color: var(--white); text-decoration: none; }
        .nav-logo span { color: var(--cyan); }
        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a { text-decoration: none; color: var(--muted); font-size: 13px; font-weight: 500; letter-spacing: 0.5px; transition: color 0.2s; }
        .nav-links a:hover, .nav-links a.active { color: var(--white); }
        .nav-right { display: flex; align-items: center; gap: 20px; }
        .nav-signin { color: var(--muted); font-size: 13px; text-decoration: none; transition: color 0.2s; }
        .nav-signin:hover { color: var(--white); }
        .nav-account-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(14,175,212,0.1); border: 1px solid rgba(14,175,212,0.2);
          height: 38px; padding: 0 4px; border-radius: 100px;
          color: var(--white); text-decoration: none; font-size: 13px; font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden; max-width: 38px; white-space: nowrap;
        }
        .nav-account-btn:hover { max-width: 250px; padding: 0 16px 0 4px; background: rgba(14,175,212,0.15); border-color: rgba(14,175,212,0.3); }
        .nab-initial {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--teal); color: var(--bg); font-weight: 700; flex-shrink: 0;
        }
        .nab-email { opacity: 0; transition: opacity 0.2s; transition-delay: 0s; }
        .nav-account-btn:hover .nab-email { opacity: 1; transition-delay: 0.1s; }
        .nav-cart { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border); background: var(--card); display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; position: relative; transition: border-color 0.2s, background 0.2s; }
        .nav-cart:hover { border-color: var(--teal); background: rgba(14,175,212,0.1); }
        .nav-cart svg { width: 16px; height: 16px; stroke: var(--muted); }
        .cart-count { position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; border-radius: 50%; background: var(--teal); color: var(--bg); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

        /* HERO */
        .hero {
          position: relative;
          z-index: 1;
          padding: 160px 48px 100px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(14,175,212,0.18) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
          pointer-events: none;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(14,175,212,0.08); border: 1px solid rgba(14,175,212,0.2);
          border-radius: 100px; padding: 6px 16px;
          font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
          color: var(--cyan); margin-bottom: 32px;
          animation: fadeUp 0.7s ease both;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(48px, 7vw, 92px);
          line-height: 1.0; letter-spacing: -2px;
          color: var(--white); max-width: 900px; margin-bottom: 24px;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero-title em { font-style: italic; color: var(--cyan); }
        .hero-sub {
          font-size: 17px; color: var(--muted); font-weight: 300;
          max-width: 540px; line-height: 1.7;
          animation: fadeUp 0.7s 0.2s ease both;
        }

        /* MISSION */
        .mission-section {
          position: relative; z-index: 1;
          padding: 100px 48px;
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: start;
        }
        .mission-block { margin-bottom: 52px; }
        .mission-block:last-child { margin-bottom: 0; }
        .mission-label { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--teal); margin-bottom: 14px; }
        .mission-title { font-family: 'DM Serif Display', serif; font-size: clamp(28px, 3vw, 40px); letter-spacing: -1px; margin-bottom: 16px; line-height: 1.1; }
        .mission-text { font-size: 15px; color: var(--muted); line-height: 1.75; }
        .mission-text p + p { margin-top: 12px; }

        .mission-right { display: flex; flex-direction: column; gap: 16px; }
        .mission-stat-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 24px 28px;
          display: flex; align-items: center; gap: 18px;
          transition: border-color 0.3s;
        }
        .mission-stat-card:hover { border-color: rgba(14,175,212,0.25); }
        .msc-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(14,175,212,0.08); border: 1px solid rgba(14,175,212,0.15); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .msc-num { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 2px; color: var(--cyan); line-height: 1; margin-bottom: 4px; }
        .msc-label { font-size: 12px; color: var(--muted); line-height: 1.4; }

        /* STATS ROW */
        .stats-section {
          position: relative; z-index: 1;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.02); padding: 60px 48px;
        }
        .stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); }
        .stat-item { display: flex; align-items: flex-start; gap: 16px; padding: 0 40px; }
        .stat-item + .stat-item { border-left: 1px solid var(--border); }
        .stat-emoji { font-size: 28px; margin-top: 4px; flex-shrink: 0; }
        .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 44px; letter-spacing: 2px; color: var(--cyan); line-height: 1; margin-bottom: 6px; }
        .stat-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

        /* SCIENCE */
        .science-section { position: relative; z-index: 1; padding: 100px 48px; max-width: 1200px; margin: 0 auto; }
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--teal); margin-bottom: 16px; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 52px); line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; }
        .section-title em { font-style: italic; color: var(--cyan); }
        .section-sub { font-size: 15px; color: var(--muted); max-width: 520px; line-height: 1.7; margin-bottom: 56px; }
        .science-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .science-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 28px;
          transition: border-color 0.3s, transform 0.3s;
          position: relative; overflow: hidden;
        }
        .science-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--teal), var(--cyan)); opacity: 0; transition: opacity 0.3s; }
        .science-card:hover { border-color: rgba(14,175,212,0.3); transform: translateY(-4px); }
        .science-card:hover::before { opacity: 1; }
        .science-num { font-family: 'Bebas Neue', sans-serif; font-size: 56px; letter-spacing: 2px; color: rgba(14,175,212,0.15); line-height: 1; margin-bottom: 12px; transition: color 0.3s; }
        .science-card:hover .science-num { color: rgba(14,175,212,0.3); }
        .science-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; }
        .science-desc { font-size: 13px; color: var(--muted); line-height: 1.7; }

        /* FOUNDERS */
        .founders-section {
          position: relative; z-index: 1;
          padding: 100px 48px;
          background: rgba(255,255,255,0.015);
          border-top: 1px solid var(--border);
        }
        .founders-inner { max-width: 1200px; margin: 0 auto; }
        .founders-header { text-align: center; margin-bottom: 64px; }
        .founders-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; max-width: 860px; margin: 0 auto; }
        .founder-card { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 36px 32px; transition: border-color 0.3s, transform 0.3s; }
        .founder-card:hover { border-color: rgba(14,175,212,0.25); transform: translateY(-4px); }
        .founder-top { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .founder-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(14,175,212,0.15), rgba(8,12,20,0.9)); border: 2px solid rgba(14,175,212,0.2); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .founder-name { font-family: 'DM Serif Display', serif; font-size: 22px; margin-bottom: 4px; }
        .founder-role { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--teal); }
        .founder-quote { font-family: 'DM Serif Display', serif; font-size: 16px; font-style: italic; color: var(--white); line-height: 1.6; margin-bottom: 14px; }
        .founder-bio { font-size: 13px; color: var(--muted); line-height: 1.7; }
        .founder-links { display: flex; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
        .founder-link { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; text-decoration: none; transition: border-color 0.2s, background 0.2s; }
        .founder-link:hover { border-color: var(--teal); background: rgba(14,175,212,0.08); }
        .founder-link svg { width: 13px; height: 13px; stroke: var(--muted); }
        .founder-link:hover svg { stroke: var(--teal); }

        /* CTA */
        .cta-section { position: relative; z-index: 1; padding: 100px 48px; text-align: center; }
        .cta-inner {
          max-width: 700px; margin: 0 auto;
          background: linear-gradient(135deg, rgba(14,175,212,0.08) 0%, var(--card) 100%);
          border: 1px solid rgba(14,175,212,0.2); border-radius: 32px; padding: 64px 48px;
          position: relative; overflow: hidden;
        }
        .cta-inner::before { content: ''; position: absolute; top: -1px; left: 20%; right: 20%; height: 1px; background: linear-gradient(90deg, transparent, var(--teal), transparent); }
        .cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 48px); letter-spacing: -1px; margin-bottom: 16px; line-height: 1.1; }
        .cta-title em { font-style: italic; color: var(--cyan); }
        .cta-sub { font-size: 15px; color: var(--muted); margin-bottom: 36px; line-height: 1.6; }
        .cta-btn { display: inline-flex; align-items: center; gap: 10px; background: var(--teal); color: var(--bg); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 100px; text-decoration: none; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 32px rgba(14,175,212,0.3); }
        .cta-btn:hover { background: var(--cyan); transform: translateY(-2px); box-shadow: 0 0 48px rgba(14,175,212,0.5); }

        /* FOOTER */
        footer { position: relative; z-index: 1; border-top: 1px solid var(--border); padding: 48px; display: flex; align-items: center; justify-content: space-between; }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 4px; color: var(--muted); }
        .footer-logo span { color: var(--teal); }
        .footer-text { font-size: 12px; color: var(--muted); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">SNA<span>P</span>D</a>
        <ul className="nav-links">
          <li><a href="/shop">Shop</a></li>
          <li><a href="/about" className="active">About</a></li>
        </ul>
        <div className="nav-right">
          {user ? (
            <a href="/account" className="nav-account-btn">
              <div className="nab-initial">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
              <span className="nab-email">{user.email}</span>
            </a>
          ) : (
            <a href="/login" className="nav-signin">Sign In</a>
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

      {/* HERO */}
      <section className="hero">
        <div className="hero-dots"></div>
        <div className="hero-eyebrow">Our Story</div>
        <h1 className="hero-title">We built the alertness<br/>we <em>actually needed.</em></h1>
        <p className="hero-sub">Drowsiness costs lives, careers, and billions of dollars every year. We decided to fix it with science — not stimulants.</p>
      </section>

      {/* MISSION / VISION */}
      <section className="mission-section">
        <div className="mission-content">
          <div className="mission-block">
            <div className="mission-label">Our Mission</div>
            <h2 className="mission-title">Make instant alertness available to everyone.</h2>
            <div className="mission-text">
              <p>Drowsy driving kills over 6,000 people in the US every year. Students fall asleep in exams. Night shift workers lose focus at the worst possible moments. The problem is universal — and the existing solutions are slow, impractical, and full of side effects.</p>
              <p>We built Snapd because we believe alertness shouldn&apos;t require a 15-minute wait or a caffeine crash. It should be instant, clean, and fit in your pocket.</p>
            </div>
          </div>
          <div className="mission-block">
            <div className="mission-label">Our Vision</div>
            <h2 className="mission-title">A world where fatigue never costs a life.</h2>
            <div className="mission-text">
              <p>We see a future where a drowsy driver pulls over, takes one inhale, and drives home safely. Where a nurse finishing a 12-hour shift stays sharp for her final hour. Where a student writes her best exam, not her most exhausted one.</p>
              <p>Snapd is the first product in that future — and we&apos;re just getting started.</p>
            </div>
          </div>
        </div>

        <div className="mission-right">
          <div className="mission-stat-card">
            <div className="msc-icon">⚡</div>
            <div>
              <div className="msc-num">&lt; 3s</div>
              <div className="msc-label">To full alertness via the olfactory nerve — faster than any other solution on the market</div>
            </div>
          </div>
          <div className="mission-stat-card">
            <div className="msc-icon">🧬</div>
            <div>
              <div className="msc-num">0</div>
              <div className="msc-label">Stimulants, caffeine, or synthetic compounds — pure essential oils and documented neuroscience</div>
            </div>
          </div>
          <div className="mission-stat-card">
            <div className="msc-icon">💰</div>
            <div>
              <div className="msc-num">$42</div>
              <div className="msc-label">Annual cost — versus $1,500+ per year for a daily coffee habit that crashes you every afternoon</div>
            </div>
          </div>
          <div className="mission-stat-card">
            <div className="msc-icon">🌿</div>
            <div>
              <div className="msc-num">15</div>
              <div className="msc-label">Variants across 5 scents and 3 intensities — the only inhaler that lets you choose your intensity</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="stats-section">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-emoji">😴</div>
            <div>
              <div className="stat-num">6,000+</div>
              <div className="stat-desc">Drowsy driving deaths per year in the US alone</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-emoji">😰</div>
            <div>
              <div className="stat-num">35%</div>
              <div className="stat-desc">Of American adults chronically sleep-deprived</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-emoji">💸</div>
            <div>
              <div className="stat-num">$411B</div>
              <div className="stat-desc">Lost annually in the US from workplace fatigue</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-emoji">⏱️</div>
            <div>
              <div className="stat-num">45min</div>
              <div className="stat-desc">Average wait for caffeine to kick in — Snapd takes 3 seconds</div>
            </div>
          </div>
        </div>
      </div>

      {/* SCIENCE */}
      <section className="science-section">
        <div className="section-label">The Science</div>
        <h2 className="section-title">Not a gimmick.<br/><em>Documented neuroscience.</em></h2>
        <p className="section-sub">Every claim Snapd makes is backed by peer-reviewed research. Here&apos;s exactly what happens when you inhale.</p>
        <div className="science-grid">
          <div className="science-card">
            <div className="science-num">01</div>
            <div className="science-title">TRPM8 Receptor Activation</div>
            <div className="science-desc">Menthol, camphor, and eucalyptol bind to TRPM8 cold-receptor proteins in your nasal mucosa — the same receptors that detect real cold temperatures. This happens within milliseconds of inhalation.</div>
          </div>
          <div className="science-card">
            <div className="science-num">02</div>
            <div className="science-title">Olfactory Nerve Signal</div>
            <div className="science-desc">Cranial Nerve I carries the signal directly to the brain, bypassing the blood-brain barrier entirely. This is why smell is the fastest of all senses. No digestion, no absorption delay.</div>
          </div>
          <div className="science-card">
            <div className="science-num">03</div>
            <div className="science-title">Norepinephrine Released</div>
            <div className="science-desc">The signal reaches the locus coeruleus — your brain&apos;s primary alertness center — triggering norepinephrine release. Sharper focus, faster reaction time, reduced fatigue. In under 3 seconds.</div>
          </div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section className="founders-section">
        <div className="founders-inner">
          <div className="founders-header">
            <div className="section-label">The Team</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>The people who<br/><em>refused to accept tired.</em></h2>
          </div>
          <div className="founders-grid">

            <div className="founder-card">
              <div className="founder-top">
                <div className="founder-avatar">👤</div>
                <div>
                  <div className="founder-name">Founder Name</div>
                  <div className="founder-role">CEO & Co-Founder</div>
                </div>
              </div>
              <div className="founder-quote">&quot;I almost fell asleep driving home from work one night. I started researching why nothing on the market worked fast enough — and that became Snapd.&quot;</div>
              <div className="founder-bio">Placeholder background. Previously built and exited a consumer health brand. Obsessed with the intersection of neuroscience and everyday life.</div>
              <div className="founder-links">
                <a href="#" className="founder-link">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="#" className="founder-link">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
              </div>
            </div>

            <div className="founder-card">
              <div className="founder-top">
                <div className="founder-avatar">👤</div>
                <div>
                  <div className="founder-name">Founder Name</div>
                  <div className="founder-role">CTO & Co-Founder</div>
                </div>
              </div>
              <div className="founder-quote">&quot;I spent years studying aromatic compounds in a lab. When I heard the idea for Snapd I knew exactly which receptors to target. The science was already there — we just had to package it.&quot;</div>
              <div className="founder-bio">Placeholder background. Formulation chemist with deep expertise in essential oil delivery systems and aromatic receptor science.</div>
              <div className="founder-links">
                <a href="#" className="founder-link">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="#" className="founder-link">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to stay<br/><em>sharp?</em></h2>
          <p className="cta-sub">Join thousands of drivers, students, and shift workers who&apos;ve switched to instant, stimulant-free alertness.</p>
          <a href="/shop" className="cta-btn">Shop Snapd →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">SNA<span>P</span>D</div>
        <div className="footer-text">© 2026 Snapd. Alertness in your pocket. Science in every inhale.</div>
        <div className="footer-text" style={{ color: 'rgba(107,122,153,0.4)' }}>No stimulants · No crash · No compromise</div>
      </footer>
    </>
  )
}
