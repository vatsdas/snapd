'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import type { Products } from '@/types/database'

type ApiEnvelope<T> = { data: T; error: null } | { data: null; error: string }

export default function Shop() {
  const [products, setProducts] = useState<Products[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [animatingCartId, setAnimatingCartId] = useState<string | null>(null)
  
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
          setCartItemIds(new Set(items.map((item: any) => item.product_id)))
        } catch (e) {}
      } else {
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
    const base = products.filter(p => !p.name.toLowerCase().includes('refill'))
    return base.filter((p) => {
      const dbScent = (p.scent || '').toLowerCase()
      const sMatch = filterScent === 'All' || dbScent === filterScent.toLowerCase()
      const dbIntensity = (p.intensity || '').toLowerCase()
      const intensityMatch = filterIntensity === 'All' || dbIntensity === filterIntensity.toLowerCase()
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

  // Labels are what we show; values are what the DB stores
  const ScentFilters: { label: string; value: string }[] = [
    { label: 'All', value: 'All' },
    { label: 'Original', value: 'original' },
    { label: 'Icy Rush', value: 'icy_rush' },
    { label: 'Inferno', value: 'inferno' },
    { label: 'Focus', value: 'focus' },
    { label: 'Calm Sharp', value: 'calm_sharp' },
  ]
  const IntensityFilters: { label: string; value: string }[] = [
    { label: 'All', value: 'All' },
    { label: 'Mild', value: 'mild' },
    { label: 'Medium', value: 'medium' },
    { label: 'Extreme', value: 'extreme' },
  ]

  function getProductDescription(scent: string | null, intensity: string | null): string {
    const s = (scent || '').toLowerCase()
    const i = (intensity || '').toLowerCase()
    const mild = i.includes('mild')
    const extreme = i.includes('extreme')

    if (s.includes('icy')) {
      // Eucalyptus + Spearmint — 1,8-cineole inhibits acetylcholinesterase
      if (mild) return 'Eucalyptus and spearmint at a measured dose. 1,8-cineole inhibits acetylcholinesterase, gently raising acetylcholine for sharper memory and quieter focus. Ideal for students and long reading sessions.'
      if (extreme) return 'Maximum eucalyptus and spearmint concentration. 1,8-cineole floods the olfactory pathway at full intensity, delivering a rapid acetylcholine surge and heightened cognitive clarity. Inhale once. Feel it in seconds.'
      return 'Eucalyptus and spearmint working through a documented mechanism: 1,8-cineole inhibits acetylcholinesterase, increasing acetylcholine for improved memory consolidation and sustained cognition. The smart choice for mental performance.'
    }
    if (s.includes('inferno')) {
      // Camphor + Black Pepper — activates TRPV1 AND TRPM8 simultaneously
      if (extreme) return 'Camphor and black pepper at maximum load. Simultaneously fires TRPV1 heat receptors and TRPM8 cold receptors — a dual-channel sensory jolt that hits the locus coeruleus hard. Eyes will water. Built for severe fatigue and first-use reaction content.'
      return 'Camphor and black pepper — the only Snapd formula that activates both TRPV1 and TRPM8 receptors at once. The dual sensory signal drives a stronger norepinephrine release from the locus coeruleus for deep, immediate alertness.'
    }
    if (s.includes('focus')) {
      // Rosemary + Lemon — cineole content linked to working memory in peer-reviewed studies
      if (mild) return 'Rosemary and lemon at a light, focused dose. Rosemary\'s cineole content is linked to improved working memory in peer-reviewed research. Subtle enough for the office; effective enough to matter at exam time.'
      return 'Rosemary and lemon — backed by published research showing rosemary\'s cineole content improves working memory and processing speed. Inhale it during the 2pm slump or before anything that requires sustained analytical thinking.'
    }
    if (s.includes('calm')) {
      // Lavender + Peppermint — linalool lowers cortisol, menthol sustains norepinephrine
      if (mild) return 'Lavender and peppermint in a gentle ratio. Linalool from lavender suppresses cortisol and calms the nervous system, while a light menthol dose sustains norepinephrine. Alert and composed — not wired.'
      return 'Lavender and peppermint in precise balance. Linalool lowers cortisol so you lose the anxiety; menthol activates TRPM8 and sustains norepinephrine so you keep the sharpness. For high-stakes moments that demand calm focus, not jittery energy.'
    }
    // Original — Peppermint + Menthol, strongest TRPM8 activator
    if (mild) return 'Peppermint and menthol at a light, everyday dose. Menthol binds TRPM8 cold receptors in the nasal mucosa, signalling the locus coeruleus to release norepinephrine. The classic Snapd hit — clean, subtle, and reliably effective.'
    if (extreme) return 'Peppermint and menthol at maximum concentration — the strongest TRPM8 activator in the Snapd line. Sends a high-amplitude signal up the olfactory nerve to the locus coeruleus in under 3 seconds. Built for drowsy drivers, night shifts, and anyone fighting serious fatigue.'
    return 'The original formula. Peppermint and menthol bind to TRPM8 cold receptors in your nasal mucosa, bypassing the blood-brain barrier entirely and triggering norepinephrine release from the locus coeruleus in under 3 seconds. No stimulants. No crash. Just documented neuroscience.'
  }

  async function onSubscribe(plan: 'monthly' | 'annual') {
    if (!user) {
      window.location.href = '/login'
      return
    }
    
    // Defaulting to the existing /api/subscribe Stripe trigger. 
    // This will activate the currently configured stripe Subscription ID.
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: user.email,
          customer_name: user?.user_metadata?.full_name || '',
          plan: plan
        })
      })
      const json = await res.json()
      if (json.data?.url) {
        window.location.href = json.data.url
      } else {
        alert(json.error || 'Failed to start subscription checkout')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  function getScentColorClass(scent: string | null) {
    if (!scent) return 'original'
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

        /* Subscriptions Section */
        .subscriptions-section {
          margin-top: 64px;
          padding-top: 64px;
          border-top: 1px solid var(--border);
        }
        
        .subscriptions-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .subscriptions-title {
          font-family: var(--font-serif);
          font-size: 40px;
          margin-bottom: 12px;
        }

        .subscriptions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .sub-card {
          border: 1px solid var(--border);
          padding: 48px;
          background: #111111;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .sub-card.featured {
          border-color: var(--teal);
        }

        .sub-card-badge {
          position: absolute;
          top: 0; right: 0;
          background: var(--teal);
          color: var(--bg);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 6px 16px;
        }

        .sub-card-title {
          font-family: var(--font-serif);
          font-size: 32px;
          margin-bottom: 8px;
        }

        .sub-card-price {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .sub-card-price span {
          font-size: 14px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sub-card-desc {
          color: var(--muted);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .sub-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sub-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .sub-feature svg {
          width: 16px; height: 16px;
          stroke: var(--teal);
        }

        .sub-btn {
          margin-top: auto;
          background: transparent;
          color: var(--fg);
          border: 1px solid var(--border);
          padding: 16px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 100px;
          transition: all 0.2s;
        }

        .sub-card.featured .sub-btn {
          background: var(--fg);
          color: var(--bg);
          border-color: var(--fg);
        }

        .sub-btn:hover {
          opacity: 0.8;
        }

        @media (max-width: 900px) {
          .subscriptions-grid { grid-template-columns: 1fr; }
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

        @media (max-width: 768px) {
          .shop-hero {
            padding: 120px 24px 48px;
          }
          .shop-hero-title {
            font-size: clamp(32px, 8vw, 48px);
          }
          .shop-hero-sub {
            font-size: 14px;
          }
          .filter-bar {
            margin-bottom: 40px;
            gap: 16px;
          }
          .filter-row {
            gap: 8px;
          }
          .filter-pill {
            font-size: 11px;
            padding: 6px 12px;
          }
          .shop-container {
            padding: 0 20px;
            margin-bottom: 64px;
          }
          .product-card {
            padding: 24px 16px;
          }
          .subscriptions-section {
            margin-top: 40px;
            padding-top: 40px;
          }
          .subscriptions-title {
            font-size: 28px;
          }
          .subscriptions-grid {
            grid-template-columns: 1fr;
          }
          .sub-card {
            padding: 32px 24px;
          }
          .sub-card-title {
            font-size: 24px;
          }
          .modal-content {
            width: 95%;
            padding: 24px;
            gap: 24px;
          }
          .modal-title {
            font-size: 28px;
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
          <div className="shop-hero">
            <h1 className="shop-hero-title">Find Your Formula.</h1>
            <p className="shop-hero-sub">5 scents. 12 ways to stay sharp.</p>
          </div>

          <div className="filter-bar">
            <div className="filter-row">
              {ScentFilters.map(f => (
                <button
                  key={f.value}
                  className={"filter-pill" + (filterScent === f.value ? " active" : "")}
                  onClick={() => setFilterScent(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="filter-row">
              {IntensityFilters.map(f => (
                <button
                  key={f.value}
                  className={"filter-pill" + (filterIntensity === f.value ? " active" : "")}
                  onClick={() => setFilterIntensity(f.value)}
                >
                  {f.label}
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
                        <p className="product-notes">{getProductDescription(p.scent, p.intensity)}</p>
                        <div className="product-intensity">Intensity: {p.intensity}</div>
                        
                        <div className="product-bottom">
                          <button className="add-to-cart-btn" onClick={() => setSelectedProduct(p)}>
                            Details
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="product-price">{formatPrice(p.price_cents)}</div>
                            <button
                              className={cartItemIds.has(p.id) ? "added-to-cart-btn" : "add-to-cart-btn"}
                              style={{
                                background: cartItemIds.has(p.id) || animatingCartId === p.id ? 'var(--fg)' : '',
                                color: cartItemIds.has(p.id) || animatingCartId === p.id ? 'var(--bg)' : '',
                                borderColor: cartItemIds.has(p.id) || animatingCartId === p.id ? 'var(--fg)' : '',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                gap: '8px'
                              }}
                              disabled={cartItemIds.has(p.id)}
                              onClick={() => {
                                if (cartItemIds.has(p.id)) return;
                                setAnimatingCartId(p.id)
                                setTimeout(() => {
                                  onAddToCart(p)
                                  setAnimatingCartId(null)
                                }, 800)
                              }}
                            >
                              {cartItemIds.has(p.id) 
                                ? 'In Cart' 
                                : animatingCartId === p.id 
                                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  : 'Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <div className="subscriptions-section">
            <div className="subscriptions-header">
              <h2 className="subscriptions-title">Never Run Out.</h2>
              <p style={{ color: 'var(--muted)' }}>Precision alertness delivered on your schedule.</p>
            </div>
            
            <div className="subscriptions-grid">
              <div className="sub-card">
                <h3 className="sub-card-title">Monthly Routine</h3>
                <div className="sub-card-price">$14.99 <span>/ month</span></div>
                <p className="sub-card-desc">Perfect for maintaining a steady supply of focus. Contains 3 fresh refill cartridges delivered precisely every 30 days.</p>
                
                <ul className="sub-features">
                  <li className="sub-feature">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>3 Refill Cartridges Base</span>
                  </li>
                  <li className="sub-feature">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Free Shipping</span>
                  </li>
                  <li className="sub-feature">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Cancel Anytime</span>
                  </li>
                </ul>
                <button className="sub-btn" onClick={() => onSubscribe('monthly')}>Subscribe Monthly</button>
              </div>

              <div className="sub-card featured">
                <div className="sub-card-badge">Most Popular</div>
                <h3 className="sub-card-title">Annual Performance</h3>
                <div className="sub-card-price">$119.99 <span>/ year</span></div>
                <p className="sub-card-desc">The ultimate commitment to cognitive clarity. Get a year's supply of precision alertness at our absolute best value.</p>
                
                <ul className="sub-features">
                  <li className="sub-feature">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>36 Refill Cartridges Total</span>
                  </li>
                  <li className="sub-feature">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Priority Shipping</span>
                  </li>
                  <li className="sub-feature">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Save 33% Annually</span>
                  </li>
                </ul>
                <button className="sub-btn" onClick={() => onSubscribe('annual')}>Subscribe Yearly</button>
              </div>
            </div>
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
                  <p className="modal-desc">{getProductDescription(selectedProduct.scent, selectedProduct.intensity)}</p>
                  <div className="modal-price">{formatPrice(selectedProduct.price_cents)}</div>
                  <button 
                    className="modal-btn" 
                    style={{
                      background: cartItemIds.has(selectedProduct.id) || addingToCart ? 'var(--fg)' : '',
                      color: cartItemIds.has(selectedProduct.id) || addingToCart ? 'var(--bg)' : '',
                      borderRadius: 100,
                      border: cartItemIds.has(selectedProduct.id) || addingToCart ? '1px solid var(--fg)' : '1px solid var(--border)',
                      padding: '16px 32px',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    disabled={cartItemIds.has(selectedProduct.id)}
                    onClick={() => {
                      if (cartItemIds.has(selectedProduct.id)) return;
                      setAddingToCart(true)
                      setTimeout(() => {
                        onAddToCart(selectedProduct)
                        setAddingToCart(false)
                      }, 800)
                    }}
                  >
                    {cartItemIds.has(selectedProduct.id) 
                      ? 'Already in Cart' 
                      : addingToCart 
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

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
