'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Products } from '@/types/database'

type ApiEnvelope<T> = { data: T; error: null } | { data: null; error: string }

export default function Shop() {
  const [products, setProducts] = useState<Products[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null)
  
  const [filterScent, setFilterScent] = useState<string>('All')

  function getImageSrc(p: Products | null) {
    if (!p) return '/products/original-medium.png'
    const s = (p.scent || '').toLowerCase()
    const i = (p.intensity || 'medium').toLowerCase()
    let scentBase = 'original'
    if (s.includes('icy')) scentBase = 'icy'
    if (s.includes('inferno')) scentBase = 'inferno'
    if (s.includes('focus')) scentBase = 'focus'
    if (s.includes('calm')) scentBase = 'calm'
    
    let intBase = 'medium'
    if (i.includes('mild')) intBase = 'mild'
    if (i.includes('extreme')) intBase = 'extreme'

    return `/products/${scentBase}-${intBase}.png`
  }
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

  function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`
  }

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

        /* Shop Hero */
        .shop-hero {
          padding: 160px 64px 80px;
          text-align: center;
        }

        .shop-hero-title {
          font-family: var(--font-serif);
          font-size: clamp(48px, 6vw, 80px);
          line-height: 1;
          letter-spacing: -1px;
          margin-bottom: 24px;
        }

        .shop-hero-sub {
          font-size: 16px;
          color: var(--muted);
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Filter Bar */
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
          margin-bottom: 80px;
        }

        .filter-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-pill {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 13px;
          font-weight: 400;
          padding: 8px 16px;
          cursor: pointer;
          transition: color 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .filter-pill:hover { color: var(--fg); }
        .filter-pill.active {
          color: var(--fg);
          border-bottom: 1px solid var(--fg);
        }

        /* Product Grid */
        .shop-container {
          max-width: 1200px;
          margin: 0 auto 120px;
          padding: 0 64px;
          flex: 1;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px 32px;
        }

        @media (max-width: 900px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .product-grid { grid-template-columns: 1fr; } }

        .product-card {
          background: #111111;
          border-top: 3px solid transparent;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          opacity: 0.9;
          transition: opacity 0.3s;
        }

        .product-card:hover { opacity: 1; }

        .product-card.original { border-top-color: #5EADA4; }
        .product-card.icy { border-top-color: #3B82F6; }
        .product-card.inferno { border-top-color: #EF4444; }
        .product-card.focus { border-top-color: #10B981; }
        .product-card.calm { border-top-color: #8B5CF6; }

        .product-name {
          font-family: var(--font-serif);
          font-size: 24px;
          margin-bottom: 8px;
        }

        .product-notes {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .product-intensity {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          margin-bottom: 32px;
        }

        .product-bottom {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-price {
          font-family: var(--font-sans);
          font-size: 16px;
        }

        .add-to-cart-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--fg);
          padding: 8px 24px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: opacity 0.2s;
          border-radius: 9999px;
        }

        .add-to-cart-btn:hover:not(:disabled) { opacity: 0.7; }
        .add-to-cart-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .added-to-cart-btn {
          background: transparent;
          border: 1px solid var(--fg);
          color: var(--fg);
          padding: 8px 24px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: default;
          border-radius: 9999px;
          opacity: 0.8;
        }

        .empty-state { text-align: center; padding: 80px 0; grid-column: 1 / -1; }
        .empty-state p { margin-bottom: 24px; color: var(--muted); }
        .clear-filters-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--fg);
          padding: 10px 24px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          border-radius: 9999px;
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
        
        .skeleton-card {
          background: #111111;
          height: 240px;
          opacity: 0.5;
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(10px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          animation: modalFadeIn 0.3s forwards;
        }

        .modal-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          max-width: 1000px;
          width: 90%;
          background: #111111;
          border: 1px solid var(--border);
          padding: 64px;
          position: relative;
          transform: scale(0.95);
          opacity: 0;
          animation: modalPop 0.4s 0.1s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-close {
          position: absolute;
          top: 24px; right: 24px;
          background: none; border: none;
          color: var(--muted); cursor: pointer;
          transition: color 0.2s;
        }
        .modal-close:hover { color: var(--fg); }

        .modal-image-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-image {
          width: 100%;
          max-width: 400px;
          object-fit: contain;
        }

        .modal-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .modal-title {
          font-family: var(--font-serif);
          font-size: 48px;
          margin-bottom: 8px;
        }

        .modal-scent {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--teal);
          margin-bottom: 24px;
        }

        .modal-desc {
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .modal-price {
          font-size: 24px;
          margin-bottom: 32px;
        }

        .modal-btn {
          background: var(--fg);
          color: var(--bg);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
          font-weight: 500;
          padding: 16px 32px;
          border: none;
          cursor: pointer;
          border-radius: 100px;
          transition: opacity 0.2s;
          text-align: center;
        }
        .modal-btn:hover { opacity: 0.8; }

        @keyframes modalFadeIn {
          to { opacity: 1; }
        }
        @keyframes modalPop {
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 900px) {
          .modal-content { grid-template-columns: 1fr; padding: 32px; gap: 32px; }
          .modal-title { font-size: 32px; }
        }
      `}</style>
      
      <div className="page-container">
        <nav>
          <a href="/" className="nav-logo">Snapd</a>
          <div className="nav-center">
            <a href="/shop" className="nav-link active">Shop</a>
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

        <main>
          <div className="shop-hero">
            <h1 className="shop-hero-title">Find Your Formula.</h1>
            <p className="shop-hero-sub">5 scents. 3 intensities. 15 ways to stay sharp.</p>
          </div>

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

          <div className="shop-container">
            {error && <div style={{ color: '#F87171', textAlign: 'center' }}>{error}</div>}
            
            {loading && !error && (
              <div className="product-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton-card"></div>
                ))}
              </div>
            )}
            
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
                    return (
                      <div key={p.id} className={"product-card " + sClass}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                          <img src={getImageSrc(p)} alt={p.name} style={{ height: '180px', objectFit: 'contain' }} />
                        </div>
                        <h3 className="product-name">{p.name}</h3>
                        <p className="product-notes">{p.description || p.scent}</p>
                        <div className="product-intensity">Intensity: {p.intensity}</div>
                        
                        <div className="product-bottom">
                          <button className="add-to-cart-btn" onClick={() => setSelectedProduct(p)}>
                            Details
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="product-price">{formatPrice(p.price_cents)}</div>
                            {cartItemIds.has(p.id) ? (
                              <button className="added-to-cart-btn" disabled>
                                In Cart
                              </button>
                            ) : (
                              <button 
                                className="add-to-cart-btn"
                                disabled={checkoutLoading === p.id}
                                onClick={() => onAddToCart(p)}
                              >
                                {checkoutLoading === p.id ? '...' : 'Add'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
          
          {/* Modal */}
          {selectedProduct && (
            <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedProduct(null)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div className="modal-image-wrap">
                  <img 
                    src={getImageSrc(selectedProduct)}
                    alt={selectedProduct.name} 
                    className="modal-image" 
                  />
                </div>
                <div className="modal-info">
                  <h2 className="modal-title">{selectedProduct.name}</h2>
                  <div className="modal-scent">{selectedProduct.scent} · {selectedProduct.intensity} Intensity</div>
                  <p className="modal-desc">{selectedProduct.description || "Precision-engineered formula designed to provide instant clarity without the crash."}</p>
                  <div className="modal-price">{formatPrice(selectedProduct.price_cents)}</div>
                  {cartItemIds.has(selectedProduct.id) ? (
                    <button className="added-to-cart-btn" style={{ background: 'var(--fg)', color: 'var(--bg)', borderRadius: 100, border: 'none', padding: '16px 32px' }} disabled>
                      Already In Cart
                    </button>
                  ) : (
                    <button className="modal-btn" onClick={() => { onAddToCart(selectedProduct); setSelectedProduct(null); }}>
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
