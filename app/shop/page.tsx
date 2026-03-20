'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Products } from '@/types/database'

type ApiEnvelope<T> = { data: T; error: null } | { data: null; error: string }

export default function Shop() {
  const [products, setProducts] = useState<Products[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filterScent, setFilterScent] = useState<string>('All')
  const [filterIntensity, setFilterIntensity] = useState<string>('All')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [cartItemIds, setCartItemIds] = useState<Set<string>>(new Set())

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCartItemIds(new Set(items.map((item: any) => item.product_id)))
        } catch (e) {}
      } else {
        setCartCount(0)
        setCartItemIds(new Set())
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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products', { method: 'GET' })
        const json = (await res.json()) as ApiEnvelope<Products[]>
        if (!res.ok || json.error) {
          setError(json.error ?? 'Failed to load products')
        } else {
          setProducts(json.data)
        }
      } catch (err) {
        setError('Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      // Robust scent matching for Calm Sharp vs Calm vs Calm Sharp
      let sMatch = false
      if (filterScent === 'All') {
        sMatch = true
      } else {
        const productScent = p.scent.toLowerCase()
        const targetScent = filterScent.toLowerCase()
        if (productScent === targetScent) {
          sMatch = true
        } else if (targetScent.includes('calm') && productScent.includes('calm')) {
          sMatch = true 
        } else if (targetScent.includes('icy') && productScent.includes('icy')) {
          sMatch = true
        }
      }
      
      const intensityMatch = filterIntensity === 'All' || p.intensity.toLowerCase() === filterIntensity.toLowerCase()
      return sMatch && intensityMatch
    })
  }, [products, filterScent, filterIntensity])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onAddToCart(product: any) {
    const stored = localStorage.getItem('snapd-cart')
    let cart = []
    if (stored) {
      try { cart = JSON.parse(stored) } catch (e) {}
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingIdx = cart.findIndex((item: any) => item.product_id === product.id)
    if (existingIdx >= 0) {
      cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1
    } else {
      let emoji = '⚡'
      const s = (product.scent || '').toLowerCase()
      if (s.includes('icy')) emoji = '❄️'
      if (s.includes('inferno')) emoji = '🔥'
      if (s.includes('focus')) emoji = '🌿'
      if (s.includes('calm')) emoji = '🫐'
      
      cart.push({
        product_id: product.id,
        name: product.name,
        scent: product.scent,
        intensity: product.intensity,
        type: product.type,
        price_cents: product.price_cents,
        quantity: 1,
        emoji
      })
    }
    
    localStorage.setItem('snapd-cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    
    setCheckoutLoading(product.id)
    setTimeout(() => setCheckoutLoading(null), 800)
  }

  const ScentFilters = ['All', 'Original', 'Icy Rush', 'Inferno', 'Focus', 'Calm Sharp']
  const IntensityFilters = ['All', 'Mild', 'Medium', 'Extreme']

  function getScentColorClass(scent: string) {
    const s = scent.toLowerCase()
    if (s.includes('original')) return 'original'
    if (s.includes('icy')) return 'icy'
    if (s.includes('inferno')) return 'inferno'
    if (s.includes('focus')) return 'focus'
    if (s.includes('calm')) return 'calm'
    return 'original'
  }

  function getIconForScent(scent: string) {
    const s = scent.toLowerCase()
    if (s.includes('original')) return '⚡'
    if (s.includes('icy')) return '❄️'
    if (s.includes('inferno')) return '🔥'
    if (s.includes('focus')) return '🧠'
    if (s.includes('calm')) return '🌙'
    return '⚡'
  }

  function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`
  }

  const SkeltonCards = () => {
    return (
      <div className="product-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-block" style={{ width: '40px', height: '40px', borderRadius: '12px' }}></div>
            <div className="skeleton-block" style={{ width: '70%', height: '20px' }}></div>
            <div className="skeleton-block" style={{ width: '40%', height: '14px', marginBottom: '24px' }}></div>
            <div className="skeleton-block" style={{ width: '60px', height: '20px', borderRadius: '100px' }}></div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="skeleton-block" style={{ width: '50px', height: '24px', margin: 0 }}></div>
              <div className="skeleton-block" style={{ width: '80px', height: '32px', margin: 0, borderRadius: '100px' }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:        #080C14;
          --bg2:       #0D1420;
          --teal:      #0EAFD4;
          --cyan:      #3DEFF7;
          --white:     #F0F6FF;
          --muted:     #6B7A99;
          --card:      rgba(255,255,255,0.04);
          --border:    rgba(255,255,255,0.08);
          --glow:      rgba(14,175,212,0.18);
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
          content: ''; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% -10%, rgba(14,175,212,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 85% 60%, rgba(61,239,247,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 30% 30% at 10% 70%, rgba(14,175,212,0.05) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        body::after {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none; z-index: 0;
        }

        /* ── NAV ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 72px;
          background: rgba(8,12,20,0.7); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'Bebas Neue', sans-serif; font-size: 28px;
          letter-spacing: 4px; color: var(--white); text-decoration: none;
        }
        .nav-logo span { color: var(--cyan); }
        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a {
          text-decoration: none; color: var(--muted);
          font-size: 13px; font-weight: 500; letter-spacing: 0.5px;
          transition: color 0.2s;
        }
        .nav-links a:hover, .nav-links a.active { color: var(--white); }
        .nav-right { display: flex; align-items: center; gap: 20px; }
        .nav-signin {
          color: var(--muted); font-size: 13px; text-decoration: none;
          transition: color 0.2s;
        }
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
        .nav-cart {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid var(--border); background: var(--card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative; text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .nav-cart:hover { border-color: var(--teal); background: var(--glow); }
        .nav-cart svg { width: 16px; height: 16px; stroke: var(--muted); }
        .cart-count {
          position: absolute; top: -5px; right: -5px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--teal); color: var(--bg);
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── HERO ── */
        .shop-hero {
          position: relative; z-index: 1;
          padding: 140px 48px 40px; text-align: center;
        }
        .shop-hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: 56px; color: var(--white);
          line-height: 1.1; margin-bottom: 16px;
        }
        .shop-hero-sub {
          font-size: 16px; color: var(--muted);
          font-weight: 300; max-width: 400px; margin: 0 auto;
        }

        /* ── FILTER BAR ── */
        .filter-bar {
          position: relative; z-index: 1;
          max-width: 1000px; margin: 0 auto 40px;
          display: flex; flex-direction: column; gap: 16px;
          align-items: center;
        }
        .filter-row {
          display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
        }
        .filter-pill {
          background: transparent; border: 1px solid var(--border);
          color: var(--muted); font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          padding: 8px 16px; border-radius: 100px;
          cursor: pointer; transition: all 0.2s;
        }
        .filter-pill:hover { border-color: rgba(255,255,255,0.2); color: var(--white); }
        .filter-pill.active {
          background: var(--teal); border-color: var(--teal);
          color: var(--bg); box-shadow: 0 0 16px rgba(14,175,212,0.3);
        }

        /* ── PRODUCT GRID ── */
        .shop-container {
          position: relative; z-index: 1;
          max-width: 1000px; margin: 0 auto 100px; padding: 0 48px; min-height: 400px;
        }
        .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 800px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .product-grid { grid-template-columns: 1fr; } }

        .product-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 24px 20px;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          position: relative; overflow: hidden; display: flex; flex-direction: column;
        }
        .product-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 4px; border-radius: 20px 20px 0 0;
        }
        .product-card.original::before { background: linear-gradient(90deg, #0EAFD4, #3DEFF7); }
        .product-card.icy::before      { background: linear-gradient(90deg, #0369A1, #38BDF8); }
        .product-card.inferno::before  { background: linear-gradient(90deg, #991B1B, #F87171); }
        .product-card.focus::before    { background: linear-gradient(90deg, #059669, #34D399); }
        .product-card.calm::before     { background: linear-gradient(90deg, #7C3AED, #A78BFA); }

        .product-card:hover { transform: translateY(-4px); }
        .product-card.original:hover { border-color: rgba(14,175,212,0.3); box-shadow: 0 8px 32px rgba(14,175,212,0.15); }
        .product-card.icy:hover      { border-color: rgba(56,189,248,0.3); box-shadow: 0 8px 32px rgba(56,189,248,0.15); }
        .product-card.inferno:hover  { border-color: rgba(248,113,113,0.3); box-shadow: 0 8px 32px rgba(248,113,113,0.15); }
        .product-card.focus:hover    { border-color: rgba(52,211,153,0.3); box-shadow: 0 8px 32px rgba(52,211,153,0.15); }
        .product-card.calm:hover     { border-color: rgba(167,139,250,0.3); box-shadow: 0 8px 32px rgba(167,139,250,0.15); }

        .product-icon-wrapper {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 16px;
        }
        .product-card.original .product-icon-wrapper { background: rgba(14,175,212,0.15); }
        .product-card.icy .product-icon-wrapper      { background: rgba(56,189,248,0.15); }
        .product-card.inferno .product-icon-wrapper  { background: rgba(248,113,113,0.15); }
        .product-card.focus .product-icon-wrapper    { background: rgba(52,211,153,0.15); }
        .product-card.calm .product-icon-wrapper     { background: rgba(167,139,250,0.15); }

        .product-name {
          font-family: 'DM Serif Display', serif; font-size: 20px;
          color: var(--white); margin-bottom: 4px; line-height: 1.1;
        }
        .product-notes {
          font-size: 12px; color: var(--muted); font-style: italic; margin-bottom: 16px;
        }
        .product-intensity {
          display: inline-block; padding: 4px 10px; border-radius: 100px;
          font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 24px; align-self: flex-start;
        }
        .product-card.original .product-intensity { background: rgba(14,175,212,0.1); color: #0EAFD4; border: 1px solid rgba(14,175,212,0.2); }
        .product-card.icy .product-intensity      { background: rgba(56,189,248,0.1); color: #38BDF8; border: 1px solid rgba(56,189,248,0.2); }
        .product-card.inferno .product-intensity  { background: rgba(248,113,113,0.1); color: #F87171; border: 1px solid rgba(248,113,113,0.2); }
        .product-card.focus .product-intensity    { background: rgba(52,211,153,0.1); color: #34D399; border: 1px solid rgba(52,211,153,0.2); }
        .product-card.calm .product-intensity     { background: rgba(167,139,250,0.1); color: #A78BFA; border: 1px solid rgba(167,139,250,0.2); }

        .product-bottom { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; }
        .product-price {
          font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: var(--white); letter-spacing: 1px;
        }
        .add-to-cart-btn {
          background: transparent; border: 1px solid var(--border);
          color: var(--white); border-radius: 100px; padding: 8px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .add-to-cart-btn:hover:not(:disabled) {
          background: var(--teal); border-color: var(--teal); color: var(--bg);
        }
        .add-to-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .added-to-cart-btn {
          background: transparent; border: 1px solid rgba(16,185,129,0.4);
          color: #10B981; border-radius: 100px; padding: 8px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          cursor: default; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
        }

        /* Skeletons */
        .skeleton-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 24px 20px; min-height: 280px;
          position: relative; overflow: hidden;
        }
        .skeleton-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          animation: shimmer 1.5s infinite; transform: translateX(-100%);
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .skeleton-block { background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 12px; }

        /* Empty State */
        .empty-state { text-align: center; padding: 60px 0; grid-column: 1 / -1; }
        .empty-state p { margin-bottom: 20px; color: var(--muted); }
        .clear-filters-btn {
          background: transparent; border: 1px solid var(--border);
          color: var(--white); border-radius: 100px; padding: 10px 24px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .clear-filters-btn:hover { background: rgba(255,255,255,0.05); }

        /* FOOTER */
        footer {
          position: relative; z-index: 1; border-top: 1px solid var(--border);
          padding: 60px 48px; display: flex; justify-content: space-between; align-items: center;
        }
        .footer-logo {
          font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 3px; color: var(--muted);
        }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a {
          font-size: 12px; color: var(--muted); text-decoration: none; transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--white); }
        
        .error-message { color: #F87171; text-align: center; padding: 40px; }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">SNAP<span>D</span></a>
        <ul className="nav-links">
          <li><a href="/shop" className="active">Shop</a></li>
          <li><a href="/about">About</a></li>
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

      <main>
        {/* HERO */}
        <div className="shop-hero">
          <h1 className="shop-hero-title">Find Your Formula.</h1>
          <p className="shop-hero-sub">5 scents. 3 intensities. 15 ways to stay sharp.</p>
        </div>

        {/* FILTER BAR */}
        <div className="filter-bar">
          <div className="filter-row">
            {ScentFilters.map(f => (
              <button
                key={f}
                className={"filter-pill" + (filterScent === f ? " active" : "")}
                onClick={() => setFilterScent(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {IntensityFilters.map(f => (
              <button
                key={f}
                className={"filter-pill" + (filterIntensity === f ? " active" : "")}
                onClick={() => setFilterIntensity(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="shop-container">
          {error && <div className="error-message">{error}</div>}
          
          {loading && !error && <SkeltonCards />}
          
          {!loading && !error && (
            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <p>No products match your selection.</p>
                  <button className="clear-filters-btn" onClick={() => { setFilterScent('All'); setFilterIntensity('All'); }}>
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredProducts.map(p => {
                  const sClass = getScentColorClass(p.scent)
                  const icon = getIconForScent(p.scent)
                  return (
                    <div key={p.id} className={"product-card " + sClass}>
                      <div className="product-icon-wrapper">{icon}</div>
                      <h3 className="product-name">{p.name}</h3>
                      <p className="product-notes">{p.description || p.scent}</p>
                      <span className="product-intensity">{p.intensity}</span>
                      
                      <div className="product-bottom">
                        <div className="product-price">{formatPrice(p.price_cents)}</div>
                        {cartItemIds.has(p.id) ? (
                          <button className="added-to-cart-btn" disabled>
                            ✓ Added to Cart
                          </button>
                        ) : (
                          <button 
                            className="add-to-cart-btn"
                            disabled={checkoutLoading === p.id}
                            onClick={() => onAddToCart(p)}
                          >
                            {checkoutLoading === p.id ? 'Adding...' : 'Add to Cart'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">SNAPD</div>
        <div className="footer-links">
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </>
  )
}
