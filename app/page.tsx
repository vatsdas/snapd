'use client'

import { useMemo, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

import type { Products } from '@/types/database'

type ApiEnvelope<T> = { data: T; error: null } | { data: null; error: string }

export default function Home() {
  const [products, setProducts] = useState<Products[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      `}</style>
      
      <div className="page-container">
        <nav>
          <a href="/" className="nav-logo">Snapd</a>
          <div className="nav-center">
            <a href="/shop" className="nav-link">Shop</a>
            <a href="/about" className="nav-link">About</a>
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
            <img src="/product-hero.png" alt="Snapd Inhaler" className="hero-image" />
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
