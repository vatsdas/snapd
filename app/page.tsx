'use client'

import Nav from '@/components/Nav'

export default function Home() {

  return (
    <>
      <style>{`
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }



        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 16px 36px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .btn:hover { opacity: 0.8; }
        
        .btn-filled {
          background: #FFFFFF;
          color: #0A0A0A;
          border: none;
        }
        
        .btn-ghost {
          background: transparent;
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        
        /* Hero */
        .hero {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          min-height: 100vh;
          padding: 140px 64px 64px;
          align-items: center;
          gap: 8vw;
        }

        .hero-text {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .hero-title {
          font-family: var(--font-serif);
          font-size: clamp(64px, 10vw, 140px);
          line-height: 0.9;
          letter-spacing: -2px;
        }

        .hero-title em {
          font-style: italic;
          color: var(--teal);
        }

        .hero-sub {
          font-size: 18px;
          color: var(--muted);
          line-height: 1.6;
          max-width: 320px;
        }
        
        .hero-image-wrap {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .hero-image {
          width: 100%;
          height: auto;
          max-height: 85vh;
          object-fit: contain;
          opacity: 0.95;
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
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            align-items: flex-start;
          }
          .hero-text {
            margin: 0 auto;
            align-items: center;
          }
          .hero-image-wrap { margin-top: 48px; }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 120px 24px 40px;
            min-height: auto;
            gap: 32px;
          }
          .hero-title {
            font-size: clamp(40px, 12vw, 64px);
            letter-spacing: -1px;
          }
          .hero-sub {
            font-size: 15px;
            max-width: 280px;
          }
          .btn {
            padding: 14px 28px;
            font-size: 11px;
          }
          .hero-image {
            max-height: 50vh;
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

        <main className="hero">
          <div className="hero-text">
            <h1 className="hero-title">Instant<br/><em>Clarity.</em></h1>
            <p className="hero-sub">The science of alertness, precision-engineered for the modern mind. Without the crash.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/shop" className="btn btn-filled">Shop Now</a>
              <a href="/about" className="btn btn-ghost">The Science</a>
            </div>
          </div>
          
          <div className="hero-image-wrap">
            <img src="/landing-hero.png" alt="Snapd Inhaler" className="hero-image" />
          </div>
        </main>

        <footer>
          <div>Snapd © 2026. Precision alertness.</div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </footer>
      </div>
    </>
  )
}
