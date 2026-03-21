'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

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

function iconForLineItem(description: string | null): string {
  const d = (description ?? '').toLowerCase()
  if (d.includes('original')) return '🌿'
  if (d.includes('icy')) return '❄️'
  if (d.includes('inferno')) return '🔥'
  if (d.includes('focus')) return '🧠'
  if (d.includes('calm')) return '🌸'
  if (d.includes('bundle') || d.includes('3-pack') || d.includes('3 pack'))
    return '📦'
  return '🧊'
}

import { Suspense } from 'react'

/** Order confirmation page; fetches Stripe session details via `/api/checkout/session`. */
function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? ''

  const confettiRef = useRef<HTMLDivElement | null>(null)
  const copyBtnRef = useRef<HTMLButtonElement | null>(null)
  const summaryToggleRef = useRef<HTMLButtonElement | null>(null)

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<CheckoutSessionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(true)

  const orderNumber = useMemo(() => {
    const core = sessionId.slice(0, 12).toUpperCase()
    return core ? core : '—'
  }, [sessionId])

  const email = session?.customer_email ?? '—'
  const lineItems = session?.line_items ?? []
  const total = formatUsdFromCents(session?.amount_total)

  useEffect(() => {
    // Confetti on load (kept identical to the original script behavior)
    const confetti = confettiRef.current
    if (!confetti) return

    confetti.innerHTML = ''
    const colors = ['#0EAFD4', '#3DEFF7', '#10B981', '#34D399', '#F0F6FF']

    for (let i = 0; i < 40; i++) {
      const dot = document.createElement('div')
      dot.className = 'dot'
      dot.style.left = Math.random() * 100 + 'vw'
      dot.style.top = '-10px'
      dot.style.background = colors[Math.floor(Math.random() * colors.length)]
      dot.style.animationDuration = Math.random() * 2 + 1.5 + 's'
      dot.style.animationDelay = Math.random() * 1.5 + 's'
      dot.style.width = dot.style.height = Math.random() * 5 + 4 + 'px'
      confetti.appendChild(dot)
    }

    // Clear cart upon successful checkout
    localStorage.removeItem('snapd-cart')
    window.dispatchEvent(new Event('cart-updated'))
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
      btn.textContent = 'Copied!'
      btn.style.color = '#10B981'
      btn.style.borderColor = 'rgba(16,185,129,0.4)'
      setTimeout(() => {
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#0EAFD4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy`
        btn.style.color = ''
        btn.style.borderColor = ''
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
    --green:     #10B981;
    --green-glow: rgba(16,185,129,0.2);
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
      radial-gradient(ellipse 50% 40% at 50% 0%, rgba(16,185,129,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 80% 80%, rgba(14,175,212,0.05) 0%, transparent 60%);
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

  /* ── NAV ── */
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

  .nav-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 4px;
    color: var(--white);
    text-decoration: none;
  }
  .nav-logo span { color: var(--cyan); }

  .nav-links {
    display: flex;
    gap: 36px;
    list-style: none;
  }
  .nav-links a {
    text-decoration: none;
    color: var(--muted);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--white); }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .nav-signin {
    color: var(--muted);
    font-size: 13px;
    text-decoration: none;
    transition: color 0.2s;
  }
  .nav-signin:hover { color: var(--white); }
  .nav-cart {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--card);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .nav-cart:hover { border-color: var(--teal); }
  .nav-cart svg { width: 16px; height: 16px; stroke: var(--muted); }

  /* ── PAGE ── */
  .page {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    padding: 120px 24px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── SUCCESS HEADER ── */
  .success-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 40px;
    animation: fadeUp 0.7s ease both;
  }

  /* Checkmark circle */
  .check-wrap {
    position: relative;
    width: 80px; height: 80px;
    margin-bottom: 28px;
  }

  .check-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(16,185,129,0.3);
    animation: ringPulse 2.5s ease infinite;
  }

  @keyframes ringPulse {
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.18); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
  }

  .check-circle {
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: rgba(16,185,129,0.12);
    border: 1px solid rgba(16,185,129,0.4);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 32px rgba(16,185,129,0.2);
    animation: fadeUp 0.5s ease both;
  }

  .check-circle svg {
    width: 28px; height: 28px;
    stroke: var(--green);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Checkmark draw animation */
  .check-circle svg path {
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    animation: drawCheck 0.5s 0.3s ease forwards;
  }

  @keyframes drawCheck {
    to { stroke-dashoffset: 0; }
  }

  .success-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(32px, 4vw, 48px);
    letter-spacing: -1px;
    color: var(--white);
    margin-bottom: 10px;
  }

  .success-sub {
    font-size: 15px;
    color: var(--muted);
    font-weight: 300;
  }

  /* ── MAIN CONTENT ── */
  .content {
    width: 100%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── ORDER NUMBER BOX ── */
  .order-num-box {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fadeUp 0.7s 0.1s ease both;
  }

  .order-num-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .order-num-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }

  .order-num-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 3px;
    color: var(--white);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(14,175,212,0.08);
    border: 1px solid rgba(14,175,212,0.2);
    border-radius: 8px;
    padding: 8px 14px;
    color: var(--teal);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .copy-btn:hover {
    background: rgba(14,175,212,0.15);
    border-color: rgba(14,175,212,0.4);
  }
  .copy-btn svg { width: 14px; height: 14px; stroke: var(--teal); }

  .email-confirm {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--muted);
  }
  .email-confirm svg { width: 16px; height: 16px; stroke: var(--teal); flex-shrink: 0; }
  .email-confirm strong { color: var(--white); }

  /* ── ORDER SUMMARY ── */
  .summary-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    animation: fadeUp 0.7s 0.2s ease both;
  }

  .summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid var(--border);
  }

  .summary-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .summary-toggle {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }
  .summary-toggle:hover { color: var(--white); }
  .summary-toggle svg { width: 18px; height: 18px; stroke: currentColor; }

  .summary-body { padding: 8px 0; }

  /* Order items */
  .order-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 24px;
    transition: background 0.2s;
  }
  .order-item:hover { background: rgba(255,255,255,0.02); }

  .item-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(14,175,212,0.15), rgba(8,12,20,0.8));
    border: 1px solid rgba(14,175,212,0.2);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
  }

  .item-info { flex: 1; }
  .item-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--white);
    margin-bottom: 3px;
  }
  .item-meta {
    font-size: 12px;
    color: var(--muted);
  }
  .item-price {
    font-size: 14px;
    font-weight: 500;
    color: var(--white);
    white-space: nowrap;
  }

  /* Totals */
  .totals {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .total-row .label { color: var(--muted); }
  .total-row .value { color: var(--white); }
  .total-row .free { color: var(--green); font-weight: 500; }

  .total-row.grand {
    padding-top: 12px;
    border-top: 1px solid var(--border);
    margin-top: 4px;
  }
  .total-row.grand .label {
    font-size: 15px;
    font-weight: 600;
    color: var(--white);
  }
  .total-row.grand .value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    letter-spacing: 1px;
    color: var(--cyan);
  }

  /* ── WHAT'S NEXT CARD ── */
  .next-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    animation: fadeUp 0.7s 0.3s ease both;
  }

  .next-title {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;
    margin-bottom: 16px;
    color: var(--white);
  }

  .next-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .next-step {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 13px;
    color: var(--muted);
  }

  .next-step-icon {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(14,175,212,0.08);
    border: 1px solid rgba(14,175,212,0.15);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .next-step-icon svg { width: 14px; height: 14px; stroke: var(--teal); }

  /* ── ACTION BUTTONS ── */
  .actions {
    display: flex;
    gap: 12px;
    animation: fadeUp 0.7s 0.4s ease both;
  }

  .btn {
    flex: 1;
    padding: 14px 24px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-primary {
    background: var(--teal);
    color: var(--bg);
    box-shadow: 0 0 24px rgba(14,175,212,0.3);
  }
  .btn-primary:hover {
    background: var(--cyan);
    box-shadow: 0 0 40px rgba(14,175,212,0.5);
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: transparent;
    color: var(--white);
    border: 1px solid var(--border);
  }
  .btn-secondary:hover {
    border-color: var(--teal);
    color: var(--teal);
    transform: translateY(-2px);
  }

  .btn svg { width: 16px; height: 16px; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── CONFETTI DOTS ── */
  .confetti {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .dot {
    position: absolute;
    width: 6px; height: 6px;
    border-radius: 50%;
    opacity: 0;
    animation: fall linear forwards;
  }

  @keyframes fall {
    0%   { opacity: 1; transform: translateY(-20px) rotate(0deg); }
    100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
  }
`}</style>

      {/* CONFETTI */}
      <div className="confetti" id="confetti" ref={confettiRef}></div>

      {/* NAV */}
      <nav style={loading ? { opacity: 0.65 } : undefined}>
        <a href="/" className="nav-logo">
          SNA<span>P</span>D
        </a>
        <ul className="nav-links">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/shop">Shop</a>
          </li>
        </ul>
        <div className="nav-right">
          <a href="/account" className="nav-signin">
            My Account
          </a>
          <div className="nav-cart">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <div
        className="page"
        style={loading ? { opacity: 0.65, transition: 'opacity 0.2s' } : undefined}
      >
        {/* SUCCESS HEADER */}
        <div className="success-header">
          <div className="check-wrap">
            <div className="check-ring"></div>
            <div className="check-circle">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="success-title">Thank you for your order!</h1>
          <p className="success-sub">
            Your order has been received and is being processed.
          </p>
        </div>

        {/* CONTENT */}
        <div className="content">
          {/* ORDER NUMBER */}
          <div className="order-num-box">
            <div className="order-num-row">
              <div>
                <div className="order-num-label">Order Number</div>
                <div className="order-num-value">{orderNumber}</div>
              </div>
              <button className="copy-btn" onClick={copyOrder} ref={copyBtnRef}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </button>
            </div>
            <div className="email-confirm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Order confirmation sent to <strong>{email}</strong>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="summary-card">
            <div className="summary-header">
              <div className="summary-title">Order Summary</div>
              <button
                className="summary-toggle"
                onClick={toggleSummary}
                ref={summaryToggleRef}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={summaryOpen ? undefined : { transform: 'rotate(180deg)' }}
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>
            <div
              className="summary-body"
              style={{ display: summaryOpen ? 'block' : 'none' }}
            >
              {lineItems.map((li, idx) => (
                <div className="order-item" key={`${li.description ?? 'item'}-${idx}`}>
                  <div className="item-icon">{iconForLineItem(li.description)}</div>
                  <div className="item-info">
                    <div className="item-name">{li.description ?? 'Item'}</div>
                    <div className="item-meta">
                      Qty: {li.quantity ?? 1}
                    </div>
                  </div>
                  <div className="item-price">{formatUsdFromCents(li.amount_total)}</div>
                </div>
              ))}
            </div>
            <div
              className="totals"
              style={{ display: summaryOpen ? 'flex' : 'none' }}
            >
              <div className="total-row">
                <span className="label">Subtotal</span>
                <span className="value">{total}</span>
              </div>
              <div className="total-row">
                <span className="label">Shipping</span>
                <span className="free">Free</span>
              </div>
              <div className="total-row">
                <span className="label">Tax</span>
                <span className="value">$0.00</span>
              </div>
              <div className="total-row grand">
                <span className="label">Total</span>
                <span className="value">{total}</span>
              </div>
            </div>
          </div>

          {/* WHAT'S NEXT */}
          <div className="next-card">
            <div className="next-title">What happens next</div>
            <div className="next-steps">
              <div className="next-step">
                <div className="next-step-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                  </svg>
                </div>
                You&apos;ll receive a confirmation email with your order details shortly.
              </div>
              <div className="next-step">
                <div className="next-step-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8h4l3 5v3h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                Your order will be packed and shipped within 1–2 business days.
              </div>
              <div className="next-step">
                <div className="next-step-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                Tracking info will be emailed once your package ships.
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="actions">
            <a href="/shop" className="btn btn-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Continue Shopping
            </a>
            <a href="/account" className="btn btn-secondary">
              View All Orders
            </a>
          </div>

          {error ? (
            <div style={{ color: '#F87171', fontSize: 13, marginTop: 10 }}>
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080C14', color: '#fff' }}>
        Loading your order...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

