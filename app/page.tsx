'use client'

import { useMemo, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

import type { Products } from '@/types/database'

type ApiEnvelope<T> = { data: T; error: null } | { data: null; error: string }

/** Landing page for Snapd; the CTA fetches in-stock products from `/api/products`. */
export default function Home() {
  const [products, setProducts] = useState<Products[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        } catch (e) {}
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

  const productSummary = useMemo(() => {
    if (!products) return null
    return products
      .slice(0, 6)
      .map((p) => `${p.name} (${p.scent}, ${p.intensity})`)
      .join(' · ')
  }, [products])

  async function onShopClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products', { method: 'GET' })
      const json = (await res.json()) as ApiEnvelope<Products[]>
      if (!res.ok || json.error) {
        setProducts(null)
        setError(json.error ?? 'Failed to load products')
        return
      }
      setProducts(json.data)
    } catch {
      setProducts(null)
      setError('Failed to load products')
    } finally {
      setLoading(false)
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

  /* ── BACKGROUND EFFECTS ── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 50% -10%, rgba(14,175,212,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 85% 60%, rgba(61,239,247,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 30% 30% at 10% 70%, rgba(14,175,212,0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* Subtle grid overlay */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
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
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--card);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .nav-cart:hover { border-color: var(--teal); background: var(--glow); }

  .nav-cart svg { width: 16px; height: 16px; stroke: var(--muted); }

  /* ── HERO ── */
  .hero {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 48px 60px;
    text-align: center;
  }

  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(14,175,212,0.1);
    border: 1px solid rgba(14,175,212,0.25);
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--cyan);
    margin-bottom: 28px;
    animation: fadeUp 0.8s ease both;
  }

  .hero-eyebrow::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(52px, 7vw, 88px);
    line-height: 1.0;
    letter-spacing: -2px;
    color: var(--white);
    max-width: 780px;
    margin-bottom: 20px;
    animation: fadeUp 0.8s 0.1s ease both;
  }

  .hero-title em {
    font-style: italic;
    color: var(--cyan);
  }

  .hero-sub {
    font-size: 16px;
    color: var(--muted);
    font-weight: 300;
    max-width: 460px;
    line-height: 1.7;
    margin-bottom: 36px;
    animation: fadeUp 0.8s 0.2s ease both;
  }

  .hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--teal);
    color: var(--bg);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 14px 28px;
    border-radius: 100px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 32px rgba(14,175,212,0.35);
    animation: fadeUp 0.8s 0.3s ease both;
    margin-bottom: 56px;
  }

  .hero-cta:hover {
    background: var(--cyan);
    transform: translateY(-2px);
    box-shadow: 0 0 48px rgba(14,175,212,0.55);
  }

  .hero-cta svg { width: 16px; height: 16px; }

  /* ── PRODUCT STAGE ── */
  .product-stage {
    position: relative;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    animation: fadeUp 0.9s 0.4s ease both;
  }

  /* Glow behind product */
  .product-glow {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14,175,212,0.22) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Vertical lines (like the reference) */
  .stage-lines {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-around;
    pointer-events: none;
    overflow: hidden;
    border-radius: 24px;
  }

  .stage-line {
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(14,175,212,0.12) 30%, rgba(14,175,212,0.12) 70%, transparent);
  }

  /* Product container */
  .product-container {
    position: relative;
    background: linear-gradient(160deg, rgba(13,20,32,0.9) 0%, rgba(8,12,20,0.95) 100%);
    border: 1px solid var(--border);
    border-radius: 32px;
    padding: 60px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 480px;
    overflow: hidden;
  }

  /* Product placeholder */
  .product-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 2;
    animation: float 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-14px); }
  }

  .product-shape {
    width: 90px;
    height: 240px;
    background: linear-gradient(160deg, #1a3a4a 0%, #0d2535 40%, #071820 100%);
    border-radius: 45px;
    border: 1px solid rgba(14,175,212,0.3);
    box-shadow:
      0 0 60px rgba(14,175,212,0.2),
      inset 0 1px 0 rgba(255,255,255,0.1),
      inset 1px 0 0 rgba(255,255,255,0.05);
    position: relative;
    overflow: hidden;
  }

  .product-shape::before {
    content: '';
    position: absolute;
    top: 12px; left: 50%; transform: translateX(-50%);
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(14,175,212,0.6), rgba(61,239,247,0.3));
    box-shadow: 0 0 20px rgba(14,175,212,0.4);
  }

  .product-shape::after {
    content: 'SNAPD';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 6px;
    color: rgba(14,175,212,0.7);
    white-space: nowrap;
  }

  .product-cap {
    width: 90px; height: 36px;
    background: linear-gradient(160deg, #1e4a5e 0%, #0d2535 100%);
    border-radius: 18px;
    border: 1px solid rgba(14,175,212,0.4);
    box-shadow: 0 4px 20px rgba(14,175,212,0.15);
    margin-bottom: -8px;
    order: -1;
  }

  .product-label {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 12px;
  }

  /* ── FLOATING CARDS ── */
  .float-card {
    position: absolute;
    z-index: 10;
    background: rgba(13,20,32,0.85);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px 22px;
    animation: fadeUp 1s ease both;
  }

  /* Left card — stat */
  .card-left {
    left: -20px;
    bottom: 80px;
    max-width: 210px;
    animation-delay: 0.6s;
  }

  .card-left .quote-mark {
    font-family: 'DM Serif Display', serif;
    font-size: 40px;
    line-height: 1;
    color: var(--teal);
    margin-bottom: 8px;
  }

  .card-left .stat-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px;
    letter-spacing: 2px;
    color: var(--cyan);
    line-height: 1;
    display: block;
    text-shadow: 0 0 20px rgba(61,239,247,0.4);
  }

  .card-left .stat-label {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
    margin-top: 4px;
  }

  .card-left .avatar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }

  .avatars {
    display: flex;
  }

  .avatar {
    width: 24px; height: 24px;
    border-radius: 50%;
    border: 2px solid var(--bg2);
    margin-right: -8px;
    font-size: 10px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600;
    color: var(--bg);
  }

  .avatar:nth-child(1) { background: #0EAFD4; }
  .avatar:nth-child(2) { background: #3DEFF7; }
  .avatar:nth-child(3) { background: #059669; }
  .avatar:nth-child(4) { background: #D97706; }

  .avatar-text {
    font-size: 10px;
    color: var(--muted);
    margin-left: 14px;
  }

  /* Right card — intensities */
  .card-right {
    right: -20px;
    top: 60px;
    max-width: 200px;
    animation-delay: 0.7s;
  }

  .card-right .card-title {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
  }

  .intensity-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .intensity-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .intensity-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .intensity-item .name {
    font-size: 13px;
    font-weight: 500;
    color: var(--white);
    flex: 1;
  }

  .intensity-item .tag {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1px;
    padding: 2px 8px;
    border-radius: 100px;
  }

  /* ── STATS BAR ── */
  .stats-bar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 28px 48px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
    animation: fadeUp 0.8s 0.8s ease both;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 48px;
    gap: 4px;
  }

  .stat-item + .stat-item {
    border-left: 1px solid var(--border);
  }

  .stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 2px;
    color: var(--cyan);
    line-height: 1;
  }

  .stat-desc {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ── SCENTS SECTION ── */
  .scents-section {
    position: relative;
    z-index: 1;
    padding: 100px 48px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--teal);
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(36px, 4vw, 52px);
    line-height: 1.1;
    letter-spacing: -1px;
    margin-bottom: 48px;
    max-width: 480px;
  }

  .section-title em {
    font-style: italic;
    color: var(--cyan);
  }

  .scents-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }

  .scent-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px 20px;
    transition: border-color 0.3s, background 0.3s, transform 0.3s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .scent-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 20px 20px 0 0;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .scent-card:hover {
    transform: translateY(-4px);
    background: rgba(255,255,255,0.06);
  }

  .scent-card:hover::before { opacity: 1; }

  .scent-card.original::before { background: linear-gradient(90deg, #0EAFD4, #3DEFF7); }
  .scent-card.icy::before      { background: linear-gradient(90deg, #0369A1, #38BDF8); }
  .scent-card.inferno::before  { background: linear-gradient(90deg, #991B1B, #F87171); }
  .scent-card.focus::before    { background: linear-gradient(90deg, #059669, #34D399); }
  .scent-card.calm::before     { background: linear-gradient(90deg, #7C3AED, #A78BFA); }

  .scent-card:hover { border-color: transparent; }
  .scent-card.original:hover { border-color: rgba(14,175,212,0.3); box-shadow: 0 8px 32px rgba(14,175,212,0.1); }
  .scent-card.icy:hover      { border-color: rgba(56,189,248,0.3); box-shadow: 0 8px 32px rgba(56,189,248,0.1); }
  .scent-card.inferno:hover  { border-color: rgba(248,113,113,0.3); box-shadow: 0 8px 32px rgba(248,113,113,0.1); }
  .scent-card.focus:hover    { border-color: rgba(52,211,153,0.3); box-shadow: 0 8px 32px rgba(52,211,153,0.1); }
  .scent-card.calm:hover     { border-color: rgba(167,139,250,0.3); box-shadow: 0 8px 32px rgba(167,139,250,0.1); }

  .scent-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    margin-bottom: 16px;
  }

  .scent-name {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    margin-bottom: 4px;
  }

  .scent-notes {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 14px;
    font-style: italic;
  }

  .scent-science {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.5;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }

  /* ── HOW IT WORKS ── */
  .how-section {
    position: relative;
    z-index: 1;
    padding: 100px 48px;
    background: rgba(255,255,255,0.015);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .how-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .how-steps {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .how-step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .step-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    color: rgba(14,175,212,0.15);
    line-height: 1;
    min-width: 40px;
    transition: color 0.3s;
  }

  .how-step:hover .step-num { color: var(--teal); }

  .step-content {}
  .step-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .step-desc {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.6;
  }

  .how-visual {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .science-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px;
  }

  .science-tag {
    display: inline-block;
    background: rgba(14,175,212,0.1);
    border: 1px solid rgba(14,175,212,0.2);
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--teal);
    margin-bottom: 14px;
  }

  .science-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    margin-bottom: 10px;
  }

  .science-desc {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.7;
  }

  /* ── PRICING ── */
  .pricing-section {
    position: relative;
    z-index: 1;
    padding: 100px 48px;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

  .pricing-cards {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 48px;
  }

  .price-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 36px 32px;
    flex: 1;
    max-width: 320px;
    text-align: left;
    transition: transform 0.3s, border-color 0.3s;
    position: relative;
    overflow: hidden;
  }

  .price-card:hover { transform: translateY(-4px); }

  .price-card.featured {
    border-color: rgba(14,175,212,0.4);
    background: linear-gradient(160deg, rgba(14,175,212,0.08) 0%, var(--card) 100%);
    box-shadow: 0 0 60px rgba(14,175,212,0.1);
  }

  .price-badge {
    display: inline-block;
    background: var(--teal);
    color: var(--bg);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 20px;
  }

  .price-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .price-amount {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px;
    letter-spacing: 2px;
    color: var(--white);
    line-height: 1;
    margin-bottom: 6px;
  }

  .price-amount span {
    font-size: 28px;
    color: var(--muted);
  }

  .price-desc {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .price-btn {
    display: block;
    text-align: center;
    padding: 13px 24px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .price-btn.primary {
    background: var(--teal);
    color: var(--bg);
    box-shadow: 0 0 24px rgba(14,175,212,0.3);
  }

  .price-btn.primary:hover {
    background: var(--cyan);
    box-shadow: 0 0 40px rgba(14,175,212,0.5);
    transform: translateY(-1px);
  }

  .price-btn.secondary {
    background: transparent;
    color: var(--white);
    border: 1px solid var(--border);
  }

  .price-btn.secondary:hover {
    border-color: var(--teal);
    color: var(--teal);
  }

  /* ── FOOTER ── */
  footer {
    position: relative;
    z-index: 1;
    border-top: 1px solid var(--border);
    padding: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: var(--muted);
  }

  .footer-logo span { color: var(--teal); }

  .footer-text {
    font-size: 12px;
    color: var(--muted);
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
        `}</style>

        {/* NAV */}
        <nav>
          <a href="/" className="nav-logo">
            SNA<span>P</span>D
          </a>
          <ul className="nav-links">
            <li>
              <a href="/shop">Shop</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
          </ul>
          <div className="nav-right">
            {user ? (
              <a href="/account" className="nav-account-btn">
                <div className="nab-initial">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
                <span className="nab-email">{user.email}</span>
              </a>
            ) : (
              <a href="/login" className="nav-signin">
                Sign In
              </a>
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

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">Neuroscience-Backed Alertness</div>
          <h1 className="hero-title">
            Wake Up
            <br />
            <em>Instantly.</em>
          </h1>


          {/* Product Stage */}
          <div className="product-stage">
            <div className="product-container">
              {/* Stage lines */}
              <div className="stage-lines">
                <div className="stage-line"></div>
                <div className="stage-line"></div>
                <div className="stage-line"></div>
                <div className="stage-line"></div>
                <div className="stage-line"></div>
                <div className="stage-line"></div>
                <div className="stage-line"></div>
              </div>

              {/* Glow */}
              <div className="product-glow"></div>

              {/* Product placeholder */}
              <div className="product-placeholder">
                <div className="product-cap"></div>
                <div className="product-shape"></div>
                <div className="product-label">Original · Extreme</div>
              </div>

              {/* LEFT CARD */}
              <div className="float-card card-left">
                <div className="quote-mark">&quot;</div>
                <span className="stat-number">&lt; 3s</span>
                <div className="stat-label">
                  Time to alertness via
                  <br />
                  olfactory nerve pathway
                </div>
                <div className="avatar-row">
                  <div className="avatars">
                    <div className="avatar">A</div>
                    <div className="avatar">J</div>
                    <div className="avatar">K</div>
                    <div className="avatar">+</div>
                  </div>
                  <span className="avatar-text">10k+ users</span>
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="float-card card-right">
                <div className="card-title">Intensity Levels</div>
                <div className="intensity-row">
                  <div className="intensity-item">
                    <div
                      className="intensity-dot"
                      style={{
                        background: '#0369A1',
                        boxShadow: '0 0 6px #0369A1',
                      }}
                    ></div>
                    <span className="name">Mild</span>
                    <span
                      className="tag"
                      style={{
                        background: 'rgba(3,105,161,0.15)',
                        color: '#38BDF8',
                        border: '1px solid rgba(56,189,248,0.2)',
                      }}
                    >
                      Focus
                    </span>
                  </div>
                  <div className="intensity-item">
                    <div
                      className="intensity-dot"
                      style={{
                        background: '#0EAFD4',
                        boxShadow: '0 0 6px #0EAFD4',
                      }}
                    ></div>
                    <span className="name">Medium</span>
                    <span
                      className="tag"
                      style={{
                        background: 'rgba(14,175,212,0.15)',
                        color: '#0EAFD4',
                        border: '1px solid rgba(14,175,212,0.2)',
                      }}
                    >
                      Daily
                    </span>
                  </div>
                  <div className="intensity-item">
                    <div
                      className="intensity-dot"
                      style={{
                        background: '#EF4444',
                        boxShadow: '0 0 6px #EF4444',
                      }}
                    ></div>
                    <span className="name">Extreme</span>
                    <span
                      className="tag"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        color: '#F87171',
                        border: '1px solid rgba(248,113,113,0.2)',
                      }}
                    >
                      Max
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="hero-sub" style={{ marginTop: 40 }}>
            Pocket-sized nasal inhaler that activates your brain&apos;s alertness
            center in under 3 seconds. No caffeine, no crash.
          </p>

          <a
            href="/shop"
            className="hero-cta"
          >
            Shop Snapd
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>

          {/* This does not change the design unless data/error exists */}
          {error ? (
            <div style={{ color: '#F87171', fontSize: 12, marginBottom: 16 }}>
              {error}
            </div>
          ) : productSummary ? (
            <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 16 }}>
              {productSummary}
            </div>
          ) : null}
        </section>

        {/* STATS BAR */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num">&lt;3s</span>
            <span className="stat-desc">To Full Alertness</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">15</span>
            <span className="stat-desc">Product Variants</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">$5.99</span>
            <span className="stat-desc">Starter Price</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">0</span>
            <span className="stat-desc">Stimulants</span>
          </div>
        </div>

        {/* SCENTS SECTION */}
        <section className="scents-section">
          <div className="section-label">The Collection</div>
          <h2 className="section-title">
            Five scents.
            <br />
            <em>One mission.</em>
          </h2>
          <div className="scents-grid">
            <div className="scent-card original">
              <div
                className="scent-icon"
                style={{ background: 'rgba(14,175,212,0.1)' }}
              >
                🌿
              </div>
              <div className="scent-name">Original</div>
              <div className="scent-notes">Peppermint + Menthol</div>
              <div className="scent-science">
                Strongest TRPM8 activator — fastest acting formula in the lineup
              </div>
            </div>
            <div className="scent-card icy">
              <div
                className="scent-icon"
                style={{ background: 'rgba(56,189,248,0.1)' }}
              >
                ❄️
              </div>
              <div className="scent-name">Icy Rush</div>
              <div className="scent-notes">Eucalyptus + Spearmint</div>
              <div className="scent-science">
                1,8-cineole boosts acetylcholine — supports memory and cognition
              </div>
            </div>
            <div className="scent-card inferno">
              <div
                className="scent-icon"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                🔥
              </div>
              <div className="scent-name">Inferno</div>
              <div className="scent-notes">Camphor + Black Pepper</div>
              <div className="scent-science">
                Dual TRPV1 + TRPM8 activation — maximum dual-receptor jolt
              </div>
            </div>
            <div className="scent-card focus">
              <div
                className="scent-icon"
                style={{ background: 'rgba(52,211,153,0.1)' }}
              >
                🧠
              </div>
              <div className="scent-name">Focus</div>
              <div className="scent-notes">Rosemary + Lemon</div>
              <div className="scent-science">
                Rosemary cineole linked to improved working memory in studies
              </div>
            </div>
            <div className="scent-card calm">
              <div
                className="scent-icon"
                style={{ background: 'rgba(167,139,250,0.1)' }}
              >
                🌸
              </div>
              <div className="scent-name">Calm Sharp</div>
              <div className="scent-notes">Lavender + Peppermint</div>
              <div className="scent-science">
                Linalool lowers cortisol while menthol sustains norepinephrine
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section">
          <div className="how-inner">
            <div>
              <div className="section-label">The Science</div>
              <h2 className="section-title" style={{ marginBottom: 40 }}>
                How it works
                <br />
                <em>in 3 seconds.</em>
              </h2>
              <div className="how-steps">
                <div className="how-step">
                  <div className="step-num">01</div>
                  <div className="step-content">
                    <div className="step-title">Inhale</div>
                    <div className="step-desc">
                      Hold under one nostril and breathe in slowly 2–3 times.
                      Total interaction: ~10 seconds.
                    </div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="step-num">02</div>
                  <div className="step-content">
                    <div className="step-title">TRPM8 Cold Receptors Fire</div>
                    <div className="step-desc">
                      Menthol and camphor bind to TRPM8 receptor proteins in your
                      nasal mucosa instantly.
                    </div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="step-num">03</div>
                  <div className="step-content">
                    <div className="step-title">
                      Signal Bypasses Blood-Brain Barrier
                    </div>
                    <div className="step-desc">
                      Cranial Nerve I carries the signal directly — no waiting
                      for digestion or absorption.
                    </div>
                  </div>
                </div>
                <div className="how-step">
                  <div className="step-num">04</div>
                  <div className="step-content">
                    <div className="step-title">Norepinephrine Released</div>
                    <div className="step-desc">
                      Your locus coeruleus fires — sharper focus, faster
                      reaction time, reduced fatigue.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="how-visual">
              <div className="science-card">
                <div className="science-tag">Peer-Reviewed</div>
                <div className="science-title">Same pathway as smelling salts</div>
                <div className="science-desc">
                  Snapd activates the exact same neurological pathway used in
                  sports medicine — documented in multiple peer-reviewed studies.
                  Every claim is verifiable.
                </div>
              </div>
              <div
                className="science-card"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(14,175,212,0.06), var(--card))',
                  borderColor: 'rgba(14,175,212,0.2)',
                }}
              >
                <div className="science-tag">Zero Stimulants</div>
                <div className="science-title">No caffeine. No crash.</div>
                <div className="science-desc">
                  Unlike caffeine which blocks adenosine receptors and causes a
                  comedown, Snapd produces no dependency, no tolerance buildup,
                  and no withdrawal. Just pure alertness, on demand.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing-section">
          <div className="section-label">Pricing</div>
          <h2
            className="section-title"
            style={{
              maxWidth: '100%',
              textAlign: 'center',
              margin: '0 auto 8px',
            }}
          >
            Less than a
            <br />
            <em>cup of coffee.</em>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 0 }}>
            Annual cost: ~$41. Daily coffee habit: $1,500+.
          </p>

          <div className="pricing-cards">
            <div className="price-card">
              <div className="price-name">Starter Kit</div>
              <div className="price-amount">
                <span>$</span>5.99
              </div>
              <div className="price-desc">
                Reusable tube + first 30-day cartridge included. One-time
                purchase.
              </div>
              <button className="price-btn secondary" type="button">
                Get Started
              </button>
            </div>
            <div className="price-card featured">
              <div className="price-badge">Best Value</div>
              <div className="price-name">Monthly Refill</div>
              <div className="price-amount">
                <span>$</span>2.49
              </div>
              <div className="price-desc">
                Auto-ship a refill every 30 days. Cancel anytime. Never run out.
              </div>
              <button className="price-btn primary" type="button">
                Subscribe Now
              </button>
            </div>
            <div className="price-card">
              <div className="price-name">3-Pack Refill</div>
              <div className="price-amount">
                <span>$</span>7.99
              </div>
              <div className="price-desc">
                Three cartridges at ~$2.66 each. Stock up and save.
              </div>
              <button className="price-btn secondary" type="button">
                Buy Bundle
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">
            SNA<span>P</span>D
          </div>
          <div className="footer-text">
            © 2026 Snapd. Alertness in your pocket. Science in every inhale.
          </div>
          <div
            className="footer-text"
            style={{ color: 'rgba(107,122,153,0.5)' }}
          >
            No stimulants · No crash · No compromise
          </div>
        </footer>
    </>
  )
}
