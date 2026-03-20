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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080C14', color: '#fff' }}>
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
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 50% 40% at 20% 50%, rgba(14,175,212,0.05) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(61,239,247,0.04) 0%, transparent 60%);
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

        /* ── TOP NAV ── */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 72px;
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
        .nav-user {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: var(--muted);
        }
        .nav-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(14,175,212,0.15);
          border: 1px solid rgba(14,175,212,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; color: var(--teal);
        }
        
        .nav-cart {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid var(--border); background: var(--card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; text-decoration: none; position: relative;
          transition: border-color 0.2s, background 0.2s;
        }
        .nav-cart:hover { border-color: var(--teal); background: rgba(14,175,212,0.1); }
        .nav-cart svg { width: 16px; height: 16px; stroke: var(--muted); }
        .cart-count {
          position: absolute; top: -4px; right: -4px;
          background: var(--teal); color: var(--bg);
          font-size: 10px; font-weight: 700;
          width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── LAYOUT ── */
        .layout {
          position: relative;
          z-index: 1;
          display: flex;
          min-height: 100vh;
          padding-top: 72px;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 260px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          padding: 40px 0;
          position: sticky;
          top: 72px;
          height: calc(100vh - 72px);
          overflow-y: auto;
          background: rgba(8,12,20,0.5);
        }

        .sidebar-user {
          padding: 0 24px 32px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .sidebar-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(14,175,212,0.2), rgba(8,12,20,0.9));
          border: 2px solid rgba(14,175,212,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 700; color: var(--teal);
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .sidebar-name {
          font-size: 15px; font-weight: 600; color: var(--white);
          margin-bottom: 3px;
        }
        .sidebar-email { font-size: 12px; color: var(--muted); }

        .sidebar-nav { padding: 0 12px; }

        .sidebar-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          padding: 16px 12px 8px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
          margin-bottom: 2px;
        }

        .sidebar-item:hover { background: var(--card); color: var(--white); }
        .sidebar-item.active {
          background: rgba(14,175,212,0.1);
          color: var(--teal);
          border: 1px solid rgba(14,175,212,0.15);
        }
        .sidebar-item.active .sidebar-icon { stroke: var(--teal); }

        .sidebar-icon {
          width: 16px; height: 16px;
          stroke: var(--muted);
          flex-shrink: 0;
          transition: stroke 0.2s;
        }
        .sidebar-item:hover .sidebar-icon { stroke: var(--white); }

        .sidebar-badge {
          margin-left: auto;
          background: rgba(14,175,212,0.15);
          color: var(--teal);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
          border: 1px solid rgba(14,175,212,0.2);
        }

        .sidebar-logout {
          margin-top: auto;
          padding: 24px 24px 0;
          border-top: 1px solid var(--border);
          margin-top: 16px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--muted);
          cursor: pointer;
          padding: 10px 12px;
          border-radius: 10px;
          transition: background 0.2s, color 0.2s;
          background: none;
          border: none;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
        }
        .logout-btn:hover { background: rgba(239,68,68,0.08); color: var(--red); }
        .logout-btn:hover svg { stroke: var(--red); }
        .logout-btn svg { width: 16px; height: 16px; stroke: var(--muted); flex-shrink: 0; transition: stroke 0.2s; }

        /* ── MAIN CONTENT ── */
        .main {
          flex: 1;
          padding: 40px 48px;
          max-width: 900px;
        }

        .page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          letter-spacing: -1px;
          margin-bottom: 8px;
        }

        .page-sub {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 40px;
        }

        /* ── SECTION ── */
        .section { margin-bottom: 48px; }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--white);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title svg { width: 18px; height: 18px; stroke: var(--teal); }

        .section-count {
          font-size: 11px;
          background: rgba(14,175,212,0.1);
          color: var(--teal);
          border: 1px solid rgba(14,175,212,0.2);
          padding: 3px 10px;
          border-radius: 100px;
          font-weight: 600;
        }

        .section-link {
          font-size: 13px;
          color: var(--teal);
          text-decoration: none;
          transition: color 0.2s;
        }
        .section-link:hover { color: var(--cyan); }

        /* ── EMPTY STATE ── */
        .empty-state {
          background: var(--card);
          border: 1px dashed var(--border);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
        }

        .empty-icon { font-size: 32px; margin-bottom: 12px; }
        .empty-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
        .empty-desc { font-size: 13px; color: var(--muted); margin-bottom: 20px; }

        .empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--teal);
          color: var(--bg);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 22px;
          border-radius: 100px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          box-shadow: 0 0 20px rgba(14,175,212,0.25);
        }
        .empty-btn:hover { background: var(--cyan); transform: translateY(-1px); }

        /* ── ORDER CARD ── */
        .order-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
          transition: border-color 0.2s;
        }
        .order-card:hover { border-color: rgba(14,175,212,0.2); }

        .order-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .order-meta { display: flex; align-items: center; gap: 20px; }

        .order-id {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 16px;
          letter-spacing: 2px;
          color: var(--white);
        }

        .order-date { font-size: 12px; color: var(--muted); }

        .order-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 100px;
          background: rgba(107,122,153,0.1);
          color: var(--muted);
          border: 1px solid rgba(107,122,153,0.2);
        }

        .status-paid {
          background: rgba(16,185,129,0.1);
          color: var(--green);
          border: 1px solid rgba(16,185,129,0.2);
        }

        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .order-total {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 1px;
          color: var(--cyan);
        }

        .order-items { padding: 12px 20px; }

        .order-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 0;
        }

        .order-item + .order-item { border-top: 1px solid var(--border); }

        .item-dot {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(14,175,212,0.08);
          border: 1px solid rgba(14,175,212,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .item-name { font-size: 13px; font-weight: 500; flex: 1; }
        .item-qty { font-size: 12px; color: var(--muted); }
        .item-price { font-size: 13px; font-weight: 500; color: var(--white); }

        /* ── SUBSCRIPTION CARD ── */
        .sub-card {
          background: var(--card);
          border: 1px solid rgba(14,175,212,0.2);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: border-color 0.2s;
          background: linear-gradient(135deg, rgba(14,175,212,0.05) 0%, var(--card) 100%);
        }
        .sub-card:hover { border-color: rgba(14,175,212,0.35); }

        .sub-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: rgba(14,175,212,0.1);
          border: 1px solid rgba(14,175,212,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .sub-info { flex: 1; }
        .sub-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; text-transform: capitalize; }
        .sub-detail { font-size: 12px; color: var(--muted); }

        .sub-right { text-align: right; }
        .sub-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          letter-spacing: 1px;
          color: var(--cyan);
          line-height: 1;
          margin-bottom: 4px;
        }
        .sub-renewal { font-size: 11px; color: var(--muted); margin-bottom: 10px; }

        .sub-cancel {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: var(--muted);
          background: none;
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 5px 12px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, color 0.2s;
        }
        .sub-cancel:hover { border-color: var(--red); color: var(--red); }

        /* ── ACCOUNT DETAILS ── */
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .detail-field {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
        }

        .detail-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .detail-value { font-size: 14px; color: var(--white); }

        .detail-provider {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--teal);
          background: rgba(14,175,212,0.08);
          border: 1px solid rgba(14,175,212,0.15);
          padding: 3px 10px;
          border-radius: 100px;
          margin-top: 4px;
        }
      `}</style>

      {/* TOP NAV */}
      <nav>
        <a href="/" className="nav-logo">SNA<span>P</span>D</a>
        <ul className="nav-links">
          <li><a href="/shop">Shop</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div className="nav-right">
          <div className="nav-user">
            <div className="nav-avatar">{initial}</div>
            {userEmail}
          </div>
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

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-name">{name}</div>
            <div className="sidebar-email">{userEmail}</div>
          </div>

          <div className="sidebar-nav">
            <div className="sidebar-section-label">Account</div>

            <a href="#details" className="sidebar-item active">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Account Details
            </a>

            <a href="#subscriptions" className="sidebar-item">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              Subscriptions
              <span className="sidebar-badge">{subscriptions.length}</span>
            </a>

            <a href="#orders" className="sidebar-item">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Order History
              <span className="sidebar-badge">{orders.length}</span>
            </a>

            <div className="sidebar-section-label">Preferences</div>

            <a href="#" className="sidebar-item">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Payment Methods
            </a>

            <a href="#" className="sidebar-item">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Shipping Address
            </a>
          </div>

          <div className="sidebar-logout">
            <a href="#" onClick={onSignOut} className="logout-btn">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </a>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main">
          
          <div className="section" id="details">
            <div className="section-header">
              <div className="section-title">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Account Details
              </div>
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
                <div className="detail-value">
                  <div className="detail-provider">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                    {provider}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="section" id="subscriptions">
            <div className="section-header">
              <div className="section-title">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
                Active Subscriptions
                <span className="section-count">{subscriptions.length}</span>
              </div>
              <a href="/shop" className="section-link">Add subscription →</a>
            </div>

            {subscriptions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🌿</div>
                <div className="empty-title">No active subscriptions</div>
                <div className="empty-desc">You aren't subscribed to any refills currently.</div>
                <a href="/shop" className="empty-btn">Shop refills</a>
              </div>
            ) : (
              subscriptions.map(sub => (
                <div key={sub.id} className="sub-card">
                  <div className="sub-icon">🌿</div>
                  <div className="sub-info">
                    <div className="sub-name">Subscription #{sub.id.slice(0, 8).toUpperCase()}</div>
                    <div className="sub-detail">Status: {sub.status}</div>
                  </div>
                  <div className="sub-right">
                    <div className="sub-renewal">Current Period Ends: {new Date(sub.current_period_end).toLocaleDateString()}</div>
                    {sub.status === 'active' && (
                      <button className="sub-cancel" onClick={() => onCancelSubscription(sub.id)}>Cancel subscription</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order History */}
          <div className="section" id="orders">
            <div className="section-header">
              <div className="section-title">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Order History
                <span className="section-count">{orders.length}</span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <div className="empty-title">No orders yet</div>
                <div className="empty-desc">When you place an order, it will appear here.</div>
                <a href="/shop" className="empty-btn">Shop now</a>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-meta">
                      <div className="order-id">ORD-{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="order-date">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className={`order-status ${order.status === 'paid' ? 'status-paid' : ''}`}>
                        <div className="status-dot"></div>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                      <div className="order-total">{formatPrice(order.total_cents)}</div>
                    </div>
                  </div>
                  <div className="order-items">
                    <div className="order-item">
                      <div className="item-dot">🌿</div>
                      <div className="item-name">Snapd Formula (Generic Item)</div>
                      <div className="item-qty">Qty: 1</div>
                      <div className="item-price">{formatPrice(order.total_cents)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </main>
      </div>
    </>
  )
}
