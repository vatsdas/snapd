'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [isSignIn, setIsSignIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // Note: With Supabase email confirmations enabled, they might need to confirm email.
        // Assuming auto-confirm is enabled or we just redirect safely.
      }
      router.push('/account')
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/account' },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      setLoading(false)
    }
  }

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
        }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg); color: var(--white);
          font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden;
        }
        body::before {
          content: ''; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% -10%, rgba(14,175,212,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 85% 60%, rgba(61,239,247,0.06) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        body::after {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none; z-index: 0;
        }

        /* NAV */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 72px;
          background: rgba(8,12,20,0.7); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 4px; color: var(--white); text-decoration: none; }
        .nav-logo span { color: var(--cyan); }

        /* AUTH CONTAINER */
        .auth-container {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; position: relative; z-index: 1; padding: 48px;
        }
        .auth-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 24px; padding: 48px; width: 100%; max-width: 440px;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .auth-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--teal), var(--cyan));
        }
        .auth-title {
          font-family: 'DM Serif Display', serif; font-size: 32px;
          margin-bottom: 8px; text-align: center; line-height: 1.2;
        }
        .auth-sub { font-size: 14px; color: var(--muted); text-align: center; margin-bottom: 32px; }
        
        .auth-form-group { margin-bottom: 20px; }
        .auth-label {
          display: block; font-size: 11px; font-weight: 600;
          letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
        }
        .auth-input {
          width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 16px; color: var(--white);
          font-family: 'DM Sans', sans-serif; font-size: 14px; transition: border-color 0.2s;
        }
        .auth-input:focus { outline: none; border-color: var(--teal); }
        
        .auth-btn {
          width: 100%; background: var(--teal); color: var(--bg);
          border: none; border-radius: 12px; padding: 14px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: background 0.2s; margin-top: 12px;
        }
        .auth-btn:hover:not(:disabled) { background: var(--cyan); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .auth-toggle { text-align: center; margin-top: 24px; font-size: 13px; color: var(--muted); }
        .auth-toggle button {
          background: none; border: none; color: var(--teal); font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; margin-left: 6px;
        }
        .auth-error {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2);
          color: #F87171; font-size: 13px; padding: 12px; border-radius: 8px; margin-bottom: 24px;
          text-align: center;
        }

        .auth-google-btn {
          width: 100%; background: rgba(0,0,0,0.2); color: var(--white);
          border: 1px solid var(--border); border-radius: 12px; padding: 14px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .auth-google-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); }
        .auth-google-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .google-icon { width: 18px; height: 18px; flex-shrink: 0; }
        
        .auth-divider {
          display: flex; align-items: center; margin: 24px 0;
          color: var(--muted); font-size: 12px; font-weight: 500;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; border-bottom: 1px solid var(--border);
        }
        .auth-divider span { padding: 0 16px; }
      `}</style>
      
      <nav>
        <a href="/" className="nav-logo">SNAP<span>D</span></a>
      </nav>

      <main className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Home.</h1>
          <p className="auth-sub">
            {isSignIn ? 'Sign in to access your orders and subscriptions.' : 'Create an account to manage your formulas.'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          <button 
            type="button" 
            className="auth-google-btn" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label">Email</label>
              <input 
                type="email" 
                className="auth-input" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <input 
                type="password" 
                className="auth-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Securing connection...' : (isSignIn ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="auth-toggle">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setIsSignIn(!isSignIn); setError(null); }}>
              {isSignIn ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
