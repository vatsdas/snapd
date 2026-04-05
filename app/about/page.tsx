'use client'

import Nav from '@/components/Nav'

export default function About() {

  return (
    <>
      <style>{`
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
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

        @media (max-width: 768px) {
          .hero {
            padding: 140px 24px 64px;
          }
          .editorial-title {
            font-size: clamp(32px, 8vw, 48px);
          }
          .hero-sub {
            font-size: 15px;
            margin-top: 24px;
          }
          .mission-section {
            padding: 48px 24px;
            gap: 48px;
          }
          .mission-title {
            font-size: 28px;
            margin-bottom: 20px;
          }
          .stats-section {
            padding: 64px 24px;
            gap: 24px;
          }
          .stat-num {
            font-size: 40px;
          }
          .science-section {
            padding: 64px 24px;
          }
          .science-header {
            margin-bottom: 48px;
          }
          .science-grid {
            gap: 32px;
          }
          .science-num {
            font-size: 36px;
          }
          .science-title {
            font-size: 22px;
          }
          .founders-section {
            padding: 64px 24px;
          }
          .founders-header {
            margin-bottom: 48px;
          }
          .founders-grid {
            gap: 40px;
          }
          .founder-name {
            font-size: 24px;
          }
          .founder-quote {
            font-size: 18px;
          }
          .cta-section {
            padding: 80px 24px;
          }
          .cta-title {
            font-size: 36px;
          }
          footer {
            padding: 32px 24px;
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
      
      <div className="page-container">
        <Nav />

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
                <h3 className="founder-name">Ishayan Das</h3>
                <div className="founder-role">Co-CEO & Co-Founder</div>
                <p className="founder-quote">&quot;I almost fell asleep driving home from work one night. I started researching why nothing on the market worked fast enough — and that became Snapd.&quot;</p>
              </div>
              <div className="founder-card">
                <h3 className="founder-name">Ranvir Tyagi</h3>
                <div className="founder-role">Co-CEO & Co-Founder</div>
                <p className="founder-quote">&quot;I spent years studying aromatic compounds. When I heard the idea for Snapd I knew exactly which receptors to target. The science was already there.&quot;</p>
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
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      </div>
    </>
  )
}
