'use client'

import { useEffect, useRef, useState } from 'react'
import Nav from '@/components/Nav'

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t
}

function ease(t: number) {
  // easeInOutQuart
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
}

function phase(t: number, start: number, end: number) {
  if (t <= start) return 0
  if (t >= end) return 1
  return (t - start) / (end - start)
}

export default function Home() {
  const [p, setP] = useState(0)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => updateScroll())
        ticking = true
      }
    }
    const updateScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const scrollable = heroRef.current.offsetHeight - window.innerHeight
        const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
        setP(progress)
      }
      ticking = false
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Phase 2: 0.0 -> 0.55 (Four descriptions animate in stagger)
  const p2_1 = ease(phase(p, 0.0, 0.25))
  const p2_2 = ease(phase(p, 0.1, 0.35))
  const p2_3 = ease(phase(p, 0.2, 0.45))
  const p2_4 = ease(phase(p, 0.3, 0.55))

  // Pause from 0.55 to 0.65

  // Phase 3: 0.65 -> 1.0 (Side shift)
  const p3 = ease(phase(p, 0.65, 1.0))
  const mainFadeOut = 1 - phase(p, 0.7, 0.85) // descriptions and headline fade out
  const tubeLeftVw = lerp(21, -25, p3)
  const tubeScale = 1.4 // slightly smaller so UI bounds physically fit inside 100vw

  const ctaOpacity = phase(p, 0.85, 1.0)
  const ctaY = lerp(20, 0, ease(ctaOpacity))

  return (
    <>
      <style>{`
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInSlideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .hero-fade-in {
          animation: fadeInSlide 1.2s ease-out forwards;
        }

        .headline-fade-in {
          animation: fadeInSlideRight 1.5s ease-out forwards;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 16px 36px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        
        .btn:hover { opacity: 0.8; transform: translateY(-1px); }
        
        .btn-filled {
          background: #FFFFFF;
          color: #0A0A0A;
          border: none;
        }
        
        .btn-ghost {
          background: transparent;
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-ghost:hover {
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        /* New Scroll Hero */
        .scroll-hero {
          height: 250vh; /* scroll track */
          background: #0A0A0A;
          position: relative;
        }

        .sticky-frame {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-canvas {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Elements */
        .huge-headline {
          position: absolute;
          left: 8vw;
          font-family: var(--font-serif);
          font-size: clamp(60px, 8vw, 120px);
          line-height: 0.9;
          letter-spacing: -2px;
          color: #FFFFFF;
          margin: 0;
        }
        
        .huge-headline em {
          font-style: italic;
          color: var(--teal);
        }

        .tube-container {
          position: absolute;
          z-index: 10;
          height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tube-image {
          height: 100%;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5));
        }

        .desc-card {
          position: absolute;
          width: 200px;
          padding: 16px;
          background: rgba(10, 10, 10, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-left: 2px solid var(--teal);
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .desc-card h3 {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 18px;
          color: #FFF;
          letter-spacing: 1px;
        }

        .desc-card p {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }
        
        @media (max-width: 900px) {
          .desc-card { width: 220px; padding: 16px; backdrop-filter: blur(4px); }
        }

        .desc-1 { top: 18%; left: calc(50% + 14vw); }
        .desc-2 { top: 28%; right: calc(50% + 5vw); }
        .desc-3 { top: 43%; left: calc(50% + 11vw); }
        .desc-4 { top: 68%; right: calc(50% + 13vw); }

        .desc-right::before {
          content: "";
          position: absolute;
          top: 50%;
          right: 100%;
          width: 40px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          margin-right: 8px;
        }
        .desc-right::after {
          content: "";
          position: absolute;
          top: calc(50% - 3px);
          right: calc(100% + 40px + 8px);
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 12px var(--teal);
        }

        .desc-left::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 100%;
          width: 40px;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
          margin-left: 8px;
        }
        .desc-left::after {
          content: "";
          position: absolute;
          top: calc(50% - 3px);
          left: calc(100% + 40px + 8px);
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 12px var(--teal);
        }

        /* End CTA inside hero */
        .hero-end-cta {
          position: absolute;
          right: 10vw;
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 400px;
        }

        .hero-end-cta h2 {
          font-family: var(--font-serif);
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1;
          margin: 0;
        }
        
        .hero-end-cta p {
          color: var(--muted);
          line-height: 1.6;
          font-size: 16px;
          margin: 0;
        }

        /* ── Page Content Sections ── */
        .content-section {
          padding: 120px 8vw;
          background: #0A0A0A;
          position: relative;
          z-index: 5;
        }

        .section-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 64px;
          text-align: center;
        }

        .eyebrow {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: var(--teal);
          font-weight: 600;
        }

        .section-title {
          font-family: var(--font-serif);
          font-size: clamp(40px, 5vw, 64px);
          line-height: 0.95;
          letter-spacing: -1px;
          margin: 0;
        }

        /* Stats Bar */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          padding: 80px 8vw;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          text-align: center;
        }

        .stat-number {
          font-family: var(--font-serif);
          font-size: clamp(48px, 6vw, 80px);
          line-height: 0.9;
        }

        .stat-number .teal {
          color: var(--teal);
          font-size: 0.6em;
          margin-left: 4px;
        }

        .stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--muted);
        }

        /* Science Section */
        .science-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .science-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 32px;
        }

        .science-thumb-wrap {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .science-thumb {
          width: 250px;
          max-width: none;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
        }

        .science-text h3 {
          font-size: 18px;
          margin: 0 0 16px 0;
          color: #FFF;
        }

        .science-text p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--muted);
          margin: 0;
        }

        /* Use Cases */
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .case-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 40px;
          border-radius: 1px;
        }

        .case-card h3 {
          font-family: var(--font-serif);
          font-size: 24px;
          margin: 0 0 16px 0;
          color: var(--teal);
        }

        .case-card p {
          font-size: 15px;
          line-height: 1.6;
          color: var(--muted);
          margin: 0;
        }

        /* Bottom CTA */
        .bottom-cta {
          padding: 120px 8vw;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
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
          .stats-bar, .science-grid, .cases-grid {
            grid-template-columns: 1fr;
          }
          .science-step {
            flex-direction: row;
            text-align: left;
          }
          .huge-headline {
            top: 15vh;
            left: 24px;
          }
          .hero-end-cta {
            right: 0;
            padding: 0 24px;
            max-width: 100%;
            text-align: center;
            align-items: center;
          }
        }
      `}</style>
      
      <div className="page-container">
        <Nav />

        {/* ═══ SCROLL HERO ═══ */}
        <section className="scroll-hero" ref={heroRef}>
          <div className="sticky-frame">
            <div className="hero-canvas">
              
              {/* Main Headline */}
              <div className="headline-fade-in" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <h1 
                  className="huge-headline"
                  style={{
                    opacity: mainFadeOut
                  }}
                >
                  Wake Up<br/><em>Instantly.</em>
                </h1>
              </div>

              {/* Product Group (Tube + Pills) translating together */}
              <div 
                style={{ 
                  position: 'absolute', 
                  width: '100vw', 
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translateX(${tubeLeftVw}vw)`,
                  pointerEvents: 'none' 
                }}
              >
               <div className="hero-fade-in" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* The Tube */}
                <div 
                  className="tube-container"
                  style={{
                    transform: `scale(${tubeScale})`
                  }}
                >
                  <img src="/product-tube.png" alt="Snapd Inhaler Tube" className="tube-image" />
                </div>

                {/* Anatomy Descriptions */}
                <div 
                  className="desc-card desc-right desc-1"
                  style={{ 
                    opacity: p2_1 * mainFadeOut, 
                    filter: `blur(${lerp(10, 0, p2_1)}px)`,
                    transform: `translateY(${lerp(20, 0, p2_1)}px) scale(${lerp(0.9, 1, p2_1)})`
                  }}
                >
                  <h3>Airtight Seal</h3>
                  <p>Machined aluminum cap preserves volatile aromatic compounds indefinitely until twisted open.</p>
                </div>
                
                <div 
                  className="desc-card desc-left desc-2"
                  style={{ 
                    opacity: p2_2 * mainFadeOut, 
                    filter: `blur(${lerp(10, 0, p2_2)}px)`,
                    transform: `translateY(${lerp(20, 0, p2_2)}px) scale(${lerp(0.9, 1, p2_2)})`
                  }}
                >
                  <h3>Delivery Wick</h3>
                  <p>Directs concentrated compounds straight into the nasal passage for maximum TRPM8 receptor activation.</p>
                </div>
                
                <div 
                  className="desc-card desc-right desc-3"
                  style={{ 
                    opacity: p2_3 * mainFadeOut, 
                    filter: `blur(${lerp(10, 0, p2_3)}px)`,
                    transform: `translateY(${lerp(20, 0, p2_3)}px) scale(${lerp(0.9, 1, p2_3)})`
                  }}
                >
                  <h3>Active Payload</h3>
                  <p>30-day supply of proprietary blend. Replaceable module inserts seamlessly into the aerospace housing.</p>
                </div>

                <div 
                  className="desc-card desc-left desc-4"
                  style={{ 
                    opacity: p2_4 * mainFadeOut, 
                    filter: `blur(${lerp(10, 0, p2_4)}px)`,
                    transform: `translateY(${lerp(20, 0, p2_4)}px) scale(${lerp(0.9, 1, p2_4)})`
                  }}
                >
                  <h3>Aerospace Body</h3>
                  <p>Precision-machined from a single block of aerospace-grade aluminum. Ergonomic, durable, and balanced.</p>
                </div>
                </div>
              </div>

              {/* End CTA */}
              <div 
                className="hero-end-cta"
                style={{
                  opacity: ctaOpacity,
                  transform: `translateY(${ctaY}px)`,
                  pointerEvents: ctaOpacity > 0.5 ? 'auto' : 'none'
                }}
              >
                <h2>The edge you need.<br/>When you need it.</h2>
                <p>Pure physiological alertness. Keep your focus sharp without the afternoon crash.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href="/shop" className="btn btn-filled">Shop Now</a>
                  <a href="/about" className="btn btn-ghost">Learn More</a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══ STATS BAR ═══ */}
        <section className="stats-bar">
          <div className="stat-item">
            <div className="stat-number">&lt;3<span className="teal">s</span></div>
            <div className="stat-label">Onset Time</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">0<span className="teal">mg</span></div>
            <div className="stat-label">Caffeine & Crash</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100<span className="teal">%</span></div>
            <div className="stat-label">Natural Actives</div>
          </div>
        </section>


        {/* ═══ USE CASES ═══ */}
        <section className="content-section">
          <div className="section-header">
            <span className="eyebrow">When to use</span>
            <h2 className="section-title">Always Ready</h2>
          </div>
          <div className="cases-grid">
            <div className="case-card">
              <h3>Early Mornings</h3>
              <p>Skip the coffee brewing wait. Instant activation the second you wake up.</p>
            </div>
            <div className="case-card">
              <h3>Mid-day Slump</h3>
              <p>When the 2PM crash hits, reboot your focus without disrupting your sleep later.</p>
            </div>
            <div className="case-card">
              <h3>Deep Work</h3>
              <p>Lock into a flow state before diving into complex problems or creative sprints.</p>
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM CTA ═══ */}
        <section className="bottom-cta content-section">
          <h2 className="section-title">Ready for instant clarity?</h2>
          <a href="/shop" className="btn btn-filled" style={{ fontSize: '13px', padding: '20px 48px' }}>
            Get Snapd Today
          </a>
        </section>

        <footer>
          <div>Snapd © 2026. Precision alertness.</div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
        </footer>
      </div>
    </>
  )
}
