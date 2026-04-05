'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Nav() {
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
        } catch {
          setCartCount(0)
        }
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
        .snapd-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32px 64px;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .snapd-nav .nav-logo {
          font-family: var(--font-serif);
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .snapd-nav .nav-center {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .snapd-nav .nav-link {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: opacity 0.2s;
        }

        .snapd-nav .nav-link:hover,
        .snapd-nav .nav-link.active { opacity: 0.5; }

        .snapd-nav .nav-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .snapd-nav .nav-account-btn {
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
        .snapd-nav .nav-account-btn:hover { border-color: var(--fg); }

        .snapd-nav .nav-initial {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: var(--fg);
          color: var(--bg);
          display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 11px;
        }

        .snapd-nav .nav-cart {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .snapd-nav .nav-cart:hover { border-color: var(--border); }
        .snapd-nav .nav-cart svg { width: 18px; height: 18px; stroke: var(--fg); }
        .snapd-nav .cart-count {
          position: absolute;
          top: -2px; right: -2px;
          background: var(--fg);
          color: var(--bg);
          font-size: 9px; font-weight: 700;
          width: 16px; height: 16px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }

        @media (max-width: 640px) {
          .snapd-nav { padding: 20px 24px; }
          .snapd-nav .nav-logo { font-size: 22px; }
          .snapd-nav .nav-center { gap: 20px; }
        }
      `}</style>

      <nav className="snapd-nav">
        <a href="/" className="nav-logo">Snapd</a>
        <div className="nav-center">
          <a href="/shop" className="nav-link">Shop</a>
          <a href="/about" className="nav-link">About</a>
        </div>
        <div className="nav-right">
          {user ? (
            <a href="/account" className="nav-account-btn">
              <div className="nav-initial">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
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
    </>
  )
}
