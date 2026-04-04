'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type ApiEnvelope<T> = { data: T; error: null } | { data: null; error: string }

type CheckoutSessionData = {
  customer_email: string | null
  amount_total: number | null
  payment_status: string
  line_items: Array<{
    description: string | null
    quantity: number | null
    amount_total: number | null
    currency: string | null
  }>
}

function formatUsdFromCents(cents: number | null | undefined): string {
  const v = typeof cents === 'number' ? cents : 0
  return `$${(v / 100).toFixed(2)}`
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? ''

  const copyBtnRef = useRef<HTMLButtonElement | null>(null)
  const summaryToggleRef = useRef<HTMLButtonElement | null>(null)

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<CheckoutSessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)

  const orderNumber = useMemo(() => {
    const core = sessionId.slice(0, 12).toUpperCase()
    return core ? core : '—'
  }, [sessionId])

  const email = session?.customer_email ?? '—'
  const lineItems = session?.line_items ?? []
  const total = formatUsdFromCents(session?.amount_total)

  useEffect(() => {
    localStorage.removeItem('snapd-cart')
    window.dispatchEvent(new Event('cart-updated'))

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
        } catch (e) {
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
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cart-updated', updateCartCount)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      setSession(null)

      if (!sessionId) {
        setLoading(false)
        setError('Missing session_id')
        return
      }

      try {
        const res = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`,
          { method: 'GET' },
        )
        const json = (await res.json()) as ApiEnvelope<CheckoutSessionData>
        if (cancelled) return

        if (!res.ok || json.error) {
          setError(json.error ?? 'Failed to load order')
          return
        }

        setSession(json.data)
      } catch {
        if (cancelled) return
        setError('Failed to load order')
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  function copyOrder() {
    const text = orderNumber
    navigator.clipboard.writeText(text).then(() => {
      const btn = copyBtnRef.current
      if (!btn) return
      btn.textContent = 'Copied'
      setTimeout(() => {
        btn.innerHTML = `Copy`
      }, 2000)
    })
  }

  function toggleSummary() {
    setSummaryOpen((v) => !v)
    const btn = summaryToggleRef.current
    const svg = btn?.querySelector('svg') as SVGElement | null
    if (svg) {
      svg.style.transform = summaryOpen ? 'rotate(180deg)' : ''
    }
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

        .page {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 160px 24px 80px;
        }

        .success-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .success-title {
          font-family: var(--font-serif);
          font-size: 48px;
          margin-bottom: 16px;
        }

        .success-sub {
          font-size: 15px;
          color: var(--muted);
        }

        .content {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .order-num-box {
          background: #111111;
          border-top: 3px solid #5EADA4;
          padding: 32px;
        }

        .order-num-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .order-num-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .order-num-value {
          font-family: var(--font-serif);
          font-size: 24px;
        }

        .copy-btn {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--fg);
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 100px;
        }

        .email-confirm {
          font-size: 13px;
          color: var(--muted);
        }

        .email-confirm strong { color: var(--fg); }

        .summary-card {
          background: #111111;
          padding: 32px;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-family: var(--font-serif);
          font-size: 24px;
        }

        .summary-toggle {
          background: none;
          border: none;
          color: var(--fg);
          cursor: pointer;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }

        .item-info { flex: 1; }
        .item-name { font-size: 14px; margin-bottom: 4px; }
        .item-meta { font-size: 12px; color: var(--muted); }
        .item-price { font-size: 14px; }

        .totals {
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--muted);
        }

        .total-row .value { color: var(--fg); }
        .total-row.grand {
          padding-top: 16px;
          border-top: 1px solid var(--border);
          font-family: var(--font-serif);
          font-size: 20px;
          color: var(--fg);
        }

        .actions {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }

        .btn-primary {
          flex: 1;
          background: var(--fg);
          color: var(--bg);
          text-align: center;
          padding: 16px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 100px;
        }

        .btn-secondary {
          flex: 1;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--fg);
          text-align: center;
          padding: 16px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 100px;
        }
      `}</style>
      
      <div className="page-container">
        <nav style={loading ? { opacity: 0.65 } : undefined}>
          <a href="/" className="nav-logo">Snapd</a>
          <div className="nav-center">
            <a href="/shop" className="nav-link">Shop</a>
            <a href="/about" className="nav-link">About</a>
          </div>
          <div className="nav-right">
            {user ? (
              <a href="/account" className="nav-account-btn">
                <div className="nab-initial">{(user.email || 'U').charAt(0).toUpperCase()}</div>
                <span>Account</span>
              </a>
            ) : (
              <a href="/account" className="nav-link">Account</a>
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

        <div className="page" style={loading ? { opacity: 0.65, transition: 'opacity 0.2s' } : undefined}>
          <div className="success-header">
            <h1 className="success-title">Order Confirmed.</h1>
            <p className="success-sub">Your order has been received and is being processed.</p>
          </div>

          <div className="content">
            <div className="order-num-box">
              <div className="order-num-row">
                <div>
                  <div className="order-num-label">Order Number</div>
                  <div className="order-num-value">{orderNumber}</div>
                </div>
                <button className="copy-btn" onClick={copyOrder} ref={copyBtnRef}>Copy</button>
              </div>
              <div className="email-confirm">
                Confirmation sent to <strong>{email}</strong>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header">
                <div>Order Summary</div>
                <button className="summary-toggle" onClick={toggleSummary} ref={summaryToggleRef}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" width="18" height="18" style={summaryOpen ? undefined : { transform: 'rotate(180deg)' }}>
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
              </div>
              <div style={{ display: summaryOpen ? 'block' : 'none' }}>
                {lineItems.map((li, idx) => (
                  <div className="order-item" key={`${li.description ?? 'item'}-${idx}`}>
                    <div className="item-info">
                      <div className="item-name">{li.description ?? 'Item'}</div>
                      <div className="item-meta">Qty: {li.quantity ?? 1}</div>
                    </div>
                    <div className="item-price">{formatUsdFromCents(li.amount_total)}</div>
                  </div>
                ))}
              </div>
              <div className="totals" style={{ display: summaryOpen ? 'flex' : 'none' }}>
                <div className="total-row">
                  <span>Subtotal</span>
                  <span className="value">{total}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span className="value" style={{ color: '#5EADA4' }}>Complimentary</span>
                </div>
                <div className="total-row grand">
                  <span>Total</span>
                  <span className="value">{total}</span>
                </div>
              </div>
            </div>

            <div className="actions">
              <a href="/shop" className="btn-primary">Continue Shopping</a>
              <a href="/account" className="btn-secondary">View Orders</a>
            </div>

            {error && <div style={{ color: '#F87171', fontSize: 13, marginTop: 10 }}>{error}</div>}
          </div>
        </div>
      </div>
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A', color: '#fff' }}>
        Loading your order...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
