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

        .nav-link:hover { opacity: 0.5; }

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

        /* Page Layout */
        .page {
          flex: 1;
          padding: 160px 64px 80px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .cart-title {
          font-family: var(--font-serif);
          font-size: 48px;
          margin-bottom: 48px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 64px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr; }
        }

        /* Cart Items */
        .cart-item {
          display: flex;
          align-items: stretch;
          gap: 24px;
          padding: 32px 0;
          border-bottom: 1px solid var(--border);
        }

        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cart-item-name {
          font-family: var(--font-serif);
          font-size: 24px;
          margin-bottom: 4px;
        }

        .cart-item-meta {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: auto;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .qty-controls {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: 100px;
          margin-top: 24px;
        }

        .qty-btn {
          width: 32px; height: 32px;
          background: none; border: none;
          color: var(--fg); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        .qty-value {
          width: 32px; text-align: center;
          font-size: 13px;
        }

        }

        .cart-item-price {
          font-family: var(--font-sans);
          font-size: 18px;
        }

        .remove-btn {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .remove-btn:hover { color: #EF4444; }

        /* Order Summary */
        .summary-panel {
          background: #111111;
          border-top: 3px solid #FFFFFF;
          padding: 40px 32px;
        }

        .summary-header {
          font-family: var(--font-serif);
          font-size: 24px;
          margin-bottom: 32px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .summary-divider {
          border-bottom: 1px solid var(--border);
          margin: 24px 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          margin-bottom: 32px;
        }

        .checkout-btn {
          width: 100%;
          background: var(--fg);
          color: var(--bg);
          border: none;
          padding: 16px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .checkout-btn:hover:not(:disabled) { opacity: 0.8; }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .continue-link {
          display: inline-block;
          margin-top: 48px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--fg);
          text-decoration: none;
          border-bottom: 1px solid var(--fg);
          padding-bottom: 2px;
        }

        .empty-cart {
          text-align: center;
          padding: 120px 0;
        }
        
        .empty-cart-title {
          font-family: var(--font-serif);
          font-size: 40px;
          margin-bottom: 16px;
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

        <div className="page">
          <h1 className="cart-title">Your Cart</h1>
          
          {cartItems.length > 0 ? (
            <div className="cart-layout">
              <div>
                <div className="cart-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 className="cart-item-name" style={{ marginBottom: 0 }}>{item.name || 'Snapd Product'}</h3>
                          <div className="cart-item-price">${((item.price_cents || 0) / 100).toFixed(2)}</div>
                        </div>
                        <div className="cart-item-meta" style={{ marginTop: '4px' }}>
                          {item.scent || 'Classic'} · {item.intensity || 'Standard'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '24px' }}>
                          <div className="qty-controls" style={{ marginTop: 0 }}>
                            <button className="qty-btn" onClick={() => changeQty(index, -1)}>−</button>
                            <div className="qty-value">{item.quantity || 1}</div>
                            <button className="qty-btn" onClick={() => changeQty(index, 1)}>+</button>
                          </div>
                          <button className="remove-btn" onClick={() => removeItem(index)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <a href="/shop" className="continue-link">Continue Shopping</a>
              </div>

              <div className="summary-panel">
                <h3 className="summary-header">Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${(subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span style={{ color: '#5EADA4' }}>Complimentary</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${(taxCents / 100).toFixed(2)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total">
                  <span>Total</span>
                  <span>${(totalCents / 100).toFixed(2)}</span>
                </div>

                <button className="checkout-btn" onClick={handleCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? 'Processing...' : 'Checkout'}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-cart">
              <h2 className="empty-cart-title">Your cart is empty.</h2>
              <a href="/shop" className="continue-link">Explore the collection</a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
