'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Orders, Subscriptions } from '@/types/database'

type ApiEnvelope<T> = { data: T; error: null } | { data: null; error: string }

export default function Account() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [orders, setOrders] = useState<Orders[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscriptions[]>([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setUserEmail(user.email || '')
        setUserId(user.id)
        fetchData(user.id)
      }
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
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cart-updated', updateCartCount)
    }
  }, [router])

  async function fetchData(id: string) {
    try {
      const [ordRes, subRes] = await Promise.all([
        fetch(`/api/orders/${id}`),
        fetch(`/api/subscriptions/${id}`)
      ])
      
      if (ordRes.ok) {
        const json = (await ordRes.json()) as ApiEnvelope<Orders[]>
        setOrders(json.data || [])
      }
      if (subRes.ok) {
        const json = (await subRes.json()) as ApiEnvelope<Subscriptions[]>
        setSubscriptions(json.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch account data', err)
    } finally {
      setLoading(false)
    }
  }

  async function onSignOut(e: React.MouseEvent) {
    e.preventDefault()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function onCancelSubscription(subId: string) {
    if (!userId) return
    const confirm = window.confirm("Are you sure you want to cancel your subscription?")
    if (!confirm) return
    
    try {
      const res = await fetch(`/api/subscriptions/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to cancel')
      fetchData(userId)
    } catch (err) {
      alert('Could not cancel subscription.')
    }
  }

  function formatPrice(cents: number) {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A', color: '#fff' }}>
        Loading your account...
      </div>
    )
  }

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'
  const name = user?.user_metadata?.full_name || (userEmail ? userEmail.split('@')[0] : 'Member')
  const provider = user?.app_metadata?.provider === 'google' ? 'Google OAuth' : 'Email & Password'
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Unknown'

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

        /* ── LAYOUT ── */
        .layout {
          position: relative;
          z-index: 1;
          display: flex;
          min-height: 100vh;
          padding-top: 100px;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 280px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          padding: 40px 0;
          position: sticky;
          top: 100px;
          height: calc(100vh - 100px);
          overflow-y: auto;
        }

        .sidebar-user {
          padding: 0 32px 32px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .sidebar-name {
          font-family: var(--font-serif);
          font-size: 32px;
          margin-bottom: 8px;
        }
        
        .sidebar-email {
          font-size: 13px;
          color: var(--muted);
        }

        .sidebar-nav {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: background 0.2s, color 0.2s;
        }

        .sidebar-item:hover, .sidebar-item.active {
          background: #111111;
          color: var(--fg);
        }

        .sidebar-badge {
          margin-left: auto;
          font-size: 11px;
        }

        .sidebar-logout {
          margin-top: auto;
          padding: 24px;
        }

        .logout-btn {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          cursor: pointer;
          background: none;
          border: none;
          transition: color 0.2s;
        }
        .logout-btn:hover { color: var(--fg); }

        /* ── MAIN CONTENT ── */
        .main {
          flex: 1;
          padding: 64px;
          max-width: 900px;
        }

        /* ── SECTION ── */
        .section { margin-bottom: 64px; }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 32px;
        }

        .section-title {
          font-family: var(--font-serif);
          font-size: 32px;
        }

        .section-link {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          text-decoration: none;
        }
        .section-link:hover { color: var(--fg); }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .detail-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
        }

        .detail-value { font-size: 15px; }

        /* ── EMPTY STATE ── */
        .empty-state {
          padding: 48px;
          text-align: center;
          background: #111111;
        }

        .empty-title {
          font-family: var(--font-serif);
          font-size: 24px;
          margin-bottom: 8px;
        }

        .empty-desc {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .empty-btn {
          display: inline-block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--fg);
          padding: 8px 16px;
          border-radius: 100px;
          text-decoration: none;
        }
        .empty-btn:hover { border-color: var(--fg); }

        /* ── CARDS ── */
        .card {
          background: #111111;
          padding: 32px;
          margin-bottom: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .card-title {
          font-family: var(--font-serif);
          font-size: 24px;
          margin-bottom: 4px;
        }

        .card-meta {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-status {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 12px;
          border: 1px solid var(--border);
          border-radius: 100px;
        }

        .card-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .sub-cancel {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          background: none;
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 6px 12px;
          cursor: pointer;
          margin-top: 24px;
        }
        .sub-cancel:hover { color: #EF4444; border-color: #EF4444; }
      `}</style>

      <div className="page-container">
        <nav>
          <a href="/" className="nav-logo">Snapd</a>
          <div className="nav-center">
            <a href="/shop" className="nav-link">Shop</a>
            <a href="/about" className="nav-link">About</a>
          </div>
          <div className="nav-right">
            <a href="/account" className="nav-account-btn">
              <div className="nab-initial">{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</div>
              <span>Account</span>
            </a>
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

        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-user">
              <div className="sidebar-name">{name}</div>
              <div className="sidebar-email">{userEmail}</div>
            </div>

            <div className="sidebar-nav">
              <a href="#details" className="sidebar-item active">Account Details</a>
              <a href="#subscriptions" className="sidebar-item">
                Subscriptions <span className="sidebar-badge">{subscriptions.length}</span>
              </a>
              <a href="#orders" className="sidebar-item">
                Orders <span className="sidebar-badge">{orders.length}</span>
              </a>
            </div>

            <div className="sidebar-logout">
              <button className="logout-btn" onClick={onSignOut}>Sign Out</button>
            </div>
          </aside>

          <main className="main">
            <div className="section" id="details">
              <div className="section-header">
                <h2 className="section-title">Account Details</h2>
              </div>
              <div className="detail-grid">
                <div className="detail-field">
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{name}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Email Address</div>
                  <div className="detail-value">{userEmail}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Member Since</div>
                  <div className="detail-value">{memberSince}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">Sign In Method</div>
                  <div className="detail-value">{provider}</div>
                </div>
              </div>
            </div>

            <div className="section" id="subscriptions">
              <div className="section-header">
                <h2 className="section-title">Active Subscriptions</h2>
                <a href="/shop" className="section-link">Add subscription</a>
              </div>

              {subscriptions.length === 0 ? (
                <div className="empty-state">
                  <h3 className="empty-title">No subscriptions</h3>
                  <p className="empty-desc">You are not currently subscribed to any refills.</p>
                  <a href="/shop" className="empty-btn">Explore Refills</a>
                </div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">Subscription #{sub.id.slice(0, 8).toUpperCase()}</div>
                        <div className="card-meta">Renews: {new Date(sub.current_period_end).toLocaleDateString()}</div>
                      </div>
                      <div className="card-status">{sub.status}</div>
                    </div>
                    {sub.status === 'active' && (
                      <button className="sub-cancel" onClick={() => onCancelSubscription(sub.id)}>Cancel subscription</button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="section" id="orders">
              <div className="section-header">
                <h2 className="section-title">Order History</h2>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <h3 className="empty-title">No orders yet</h3>
                  <p className="empty-desc">When you place an order, it will appear here.</p>
                  <a href="/shop" className="empty-btn">Shop now</a>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                        <div className="card-meta">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="card-status">{order.status}</div>
                    </div>
                    <div className="card-row">
                      <span>Snapd Formula</span>
                      <span>{formatPrice(order.total_cents)}</span>
                    </div>
                    <div className="card-row" style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>Total</span>
                      <span style={{ fontSize: '20px' }}>{formatPrice(order.total_cents)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
