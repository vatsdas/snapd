'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Cart() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cartItems, setCartItems] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    const updateCart = () => {
      const stored = localStorage.getItem('snapd-cart')
      if (stored) {
        try {
          const items = JSON.parse(stored)
          setCartItems(items)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCartCount(items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0))
        } catch (e) {
          console.error(e)
        }
      } else {
        setCartItems([])
        setCartCount(0)
      }
    }
    updateCart()

    window.addEventListener('storage', updateCart)
    window.addEventListener('cart-updated', updateCart)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      window.removeEventListener('storage', updateCart)
      window.removeEventListener('cart-updated', updateCart)
      subscription.unsubscribe()
    }
  }, [])

  const changeQty = (index: number, delta: number) => {
    const newCart = [...cartItems]
    newCart[index].quantity = (newCart[index].quantity || 1) + delta
    if (newCart[index].quantity < 1) newCart[index].quantity = 1
    
    setCartItems(newCart)
    localStorage.setItem('snapd-cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const removeItem = (index: number) => {
    const newCart = [...cartItems]
    newCart.splice(index, 1)
    
    setCartItems(newCart)
    localStorage.setItem('snapd-cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    setCheckoutLoading(true)
    try {
      const items = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity || 1
      }))
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer_id: user?.id, customer_email: user?.email })
      })

      if (!res.ok) {
        throw new Error('Checkout failed')
      }
      const body = await res.json()
      if (body.data && body.data.url) {
        window.location.href = body.data.url
      } else {
        throw new Error(body.error || 'Checkout failed')
      }
    } catch (error) {
      console.error(error)
      alert("Error processing checkout.")
      setCheckoutLoading(false)
    }
  }

  if (!mounted) return null

  const subtotalCents = cartItems.reduce((acc, item) => acc + (item.price_cents * (item.quantity || 1)), 0)
  const taxCents = Math.round(subtotalCents * 0.08)
  const totalCents = subtotalCents + taxCents

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #080C14;
          --bg2:      #0D1420;
          --teal:     #0EAFD4;
          --cyan:     #3DEFF7;
          --white:    #F0F6FF;
          --muted:    #6B7A99;
          --card:     rgba(255,255,255,0.04);
          --border:   rgba(255,255,255,0.08);
          --green:    #10B981;
          --red:      #EF4444;
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
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 20% 30%, rgba(14,175,212,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(61,239,247,0.04) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }

        body::after {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none; z-index: 0;
        }

        /* ── NAV ── */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 72px;
          background: rgba(8,12,20,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 4px; color: var(--white); text-decoration: none; }
        .nav-logo span { color: var(--cyan); }
        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a { text-decoration: none; color: var(--muted); font-size: 13px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: var(--white); }
        .nav-right { display: flex; align-items: center; gap: 20px; }
        .nav-signin { color: var(--muted); font-size: 13px; text-decoration: none; transition: color 0.2s; }
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
          border: 1px solid var(--teal); background: rgba(14,175,212,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative; text-decoration: none;
        }
        .nav-cart svg { width: 16px; height: 16px; stroke: var(--teal); }
        .cart-count {
          position: absolute; top: -5px; right: -5px;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--teal); color: var(--bg);
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── PAGE ── */
        .page {
          position: relative; z-index: 1;
          padding: 100px 48px 80px;
          max-width: 1200px; margin: 0 auto;
        }

        /* ── PROGRESS BAR ── */
        .progress {
          display: flex; align-items: center; justify-content: center;
          gap: 0; margin-bottom: 48px;
        }

        .prog-step {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          position: relative;
        }

        .prog-circle {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          border: 2px solid var(--border);
          color: var(--muted);
          background: var(--bg2);
          position: relative; z-index: 1;
        }

        .prog-circle.active {
          background: var(--teal); color: var(--bg);
          border-color: var(--teal);
          box-shadow: 0 0 20px rgba(14,175,212,0.4);
        }

        .prog-label { font-size: 12px; color: var(--muted); font-weight: 500; }
        .prog-label.active { color: var(--white); }

        .prog-line {
          width: 120px; height: 1px;
          background: var(--border);
          margin-bottom: 20px;
        }

        /* ── LAYOUT ── */
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          align-items: start;
        }

        /* ── CART HEADER ── */
        .cart-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }

        .cart-title {
          font-family: 'DM Serif Display', serif;
          font-size: 24px; letter-spacing: -0.5px;
        }

        .cart-count-label {
          font-size: 13px; color: var(--muted);
        }

        /* ── CART ITEMS ── */
        .cart-items {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
        }

        .cart-item {
          display: flex; align-items: center; gap: 18px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
          position: relative;
        }
        .cart-item:last-child { border-bottom: none; }
        .cart-item:hover { background: rgba(255,255,255,0.02); }

        /* Product icon */
        .cart-item-icon {
          width: 64px; height: 64px; flex-shrink: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(14,175,212,0.12), rgba(8,12,20,0.8));
          border: 1px solid rgba(14,175,212,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          position: relative; overflow: hidden;
        }

        .cart-item-info { flex: 1; min-width: 0; }

        .cart-item-name {
          font-size: 15px; font-weight: 600; color: var(--white);
          margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .cart-item-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: var(--muted);
          margin-bottom: 10px;
        }

        .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }

        .intensity-badge {
          display: inline-flex; align-items: center;
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          padding: 2px 8px; border-radius: 100px;
        }

        .intensity-mild   { background: rgba(3,105,161,0.15); color: #38BDF8; border: 1px solid rgba(56,189,248,0.2); }
        .intensity-medium { background: rgba(14,175,212,0.15); color: #0EAFD4; border: 1px solid rgba(14,175,212,0.2); }
        .intensity-extreme{ background: rgba(239,68,68,0.15); color: #F87171; border: 1px solid rgba(248,113,113,0.2); }

        /* Quantity controls */
        .qty-controls {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 100px;
          overflow: hidden;
          width: fit-content;
        }

        .qty-btn {
          width: 32px; height: 32px;
          background: none; border: none;
          color: var(--muted); cursor: pointer;
          font-size: 16px; font-weight: 300;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .qty-btn:hover { background: rgba(14,175,212,0.1); color: var(--teal); }

        .qty-value {
          width: 32px; text-align: center;
          font-size: 13px; font-weight: 600; color: var(--white);
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          line-height: 32px;
        }

        /* Item price & remove */
        .cart-item-right {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 10px;
          flex-shrink: 0;
        }

        .cart-item-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 1px;
          color: var(--white);
        }

        .remove-btn {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: var(--muted);
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
          padding: 4px 0;
        }
        .remove-btn:hover { color: var(--red); }
        .remove-btn svg { width: 13px; height: 13px; stroke: currentColor; }

        /* ── EMPTY CART ── */
        .empty-cart {
          background: var(--card);
          border: 1px dashed var(--border);
          border-radius: 20px;
          padding: 64px 40px;
          text-align: center;
        }
        .empty-cart-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-cart-title { font-family: 'DM Serif Display', serif; font-size: 24px; margin-bottom: 8px; }
        .empty-cart-sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
        .empty-cart-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--teal); color: var(--bg);
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          padding: 12px 28px; border-radius: 100px; text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          box-shadow: 0 0 24px rgba(14,175,212,0.3);
        }
        .empty-cart-btn:hover { background: var(--cyan); transform: translateY(-2px); }

        /* ── ORDER SUMMARY (right panel) ── */
        .summary-panel {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          position: sticky;
          top: 92px;
        }

        .summary-panel-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 15px; font-weight: 600;
        }

        .summary-rows {
          padding: 20px 24px;
          display: flex; flex-direction: column; gap: 12px;
          border-bottom: 1px solid var(--border);
        }

        .summary-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px;
        }

        .summary-row .label { color: var(--muted); }
        .summary-row .value { color: var(--white); font-weight: 500; }
        .summary-row .free { color: var(--green); font-weight: 600; }
        .summary-row .discount { color: var(--green); font-weight: 600; }

        .summary-divider {
          height: 1px; background: var(--border);
          margin: 4px 0;
        }

        .summary-total {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
        }

        .total-label { font-size: 15px; font-weight: 600; }
        .total-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px; letter-spacing: 1px;
          color: var(--cyan);
        }

        .checkout-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 18px 24px;
          background: var(--teal); color: var(--bg);
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          border: none; cursor: pointer;
          transition: background 0.2s;
          letter-spacing: 0.3px;
        }
        .checkout-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .checkout-btn:hover:not(:disabled) { background: var(--cyan); }
        .checkout-btn svg { width: 18px; height: 18px; stroke: currentColor; }

        .summary-footer {
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 11px; color: var(--muted);
        }
        .summary-footer svg { width: 13px; height: 13px; stroke: var(--muted); }

        /* ── CONTINUE SHOPPING ── */
        .continue-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--muted);
          text-decoration: none; margin-top: 16px;
          transition: color 0.2s;
        }
        .continue-link:hover { color: var(--teal); }
        .continue-link svg { width: 16px; height: 16px; stroke: currentColor; }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">SNA<span>P</span>D</a>
        <ul className="nav-links">
          <li><a href="/shop">Shop</a></li>
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
            {cartCount > 0 && (
              <div className="cart-count">{cartCount}</div>
            )}
          </a>
        </div>
      </nav>

      <div className="page">

        {/* PROGRESS */}
        <div className="progress">
          <div className="prog-step">
            <div className="prog-circle active">1</div>
            <div className="prog-label active">Cart</div>
          </div>
          <div className="prog-line"></div>
          <div className="prog-step">
            <div className="prog-circle">2</div>
            <div className="prog-label">Details</div>
          </div>
          <div className="prog-line"></div>
          <div className="prog-step">
            <div className="prog-circle">3</div>
            <div className="prog-label">Payment</div>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="cart-layout">
            {/* LEFT: CART ITEMS */}
            <div>
              <div className="cart-header">
                <div className="cart-title">Your Cart</div>
                <div className="cart-count-label">{cartCount} items</div>
              </div>

              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-icon">{item.emoji || '📦'}</div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name || 'Snapd Product'}</div>
                      <div className="cart-item-meta">
                        <span>{item.scent || 'Any scent'}</span>
                        <div className="meta-dot"></div>
                        {item.intensity ? (
                          <span className={`intensity-badge intensity-${item.intensity.toLowerCase()}`}>
                            {item.intensity.toUpperCase()}
                          </span>
                        ) : (
                          <span>Standard</span>
                        )}
                      </div>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => changeQty(index, -1)}>−</button>
                        <div className="qty-value">{item.quantity || 1}</div>
                        <button className="qty-btn" onClick={() => changeQty(index, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <div className="cart-item-price">${((item.price_cents || 0) / 100).toFixed(2)}</div>
                      <button className="remove-btn" onClick={() => removeItem(index)}>
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <a href="/shop" className="continue-link">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Continue Shopping
              </a>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="summary-panel">
              <div className="summary-panel-header">Price Details</div>

              <div className="summary-rows">
                {cartItems.map((item, index) => (
                  <div key={index} className="summary-row">
                    <span className="label">{item.name} (×{item.quantity || 1})</span>
                    <span className="value">${(((item.price_cents || 0) * (item.quantity || 1)) / 100).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="summary-divider"></div>
                <div className="summary-row">
                  <span className="label">Subtotal</span>
                  <span className="value">${(subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Shipping</span>
                  <span className="free">Free</span>
                </div>
                <div className="summary-row">
                  <span className="label">Tax</span>
                  <span className="value">${(taxCents / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-total">
                <div className="total-label">Total Amount</div>
                <div className="total-value">${(totalCents / 100).toFixed(2)}</div>
              </div>

              <button className="checkout-btn" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? 'Processing...' : 'Place Order'}
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              <div className="summary-footer">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Secure checkout via Stripe
              </div>
            </div>

          </div>
        ) : (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <div className="empty-cart-title">Your cart is empty</div>
            <div className="empty-cart-sub">Looks like you haven't added any products yet</div>
            <a href="/shop" className="empty-cart-btn">Shop Products</a>
          </div>
        )}
      </div>
    </>
  )
}
