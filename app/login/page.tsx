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
      }
      router.push('/account')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      setLoading(false)
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

        .auth-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 48px;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background: #111111;
          border-top: 3px solid #FFFFFF;
          padding: 48px;
        }

        .auth-title {
          font-family: var(--font-serif);
          font-size: 40px;
          margin-bottom: 8px;
          text-align: center;
        }

        .auth-sub {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-form-group {
          margin-bottom: 24px;
        }

        .auth-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .auth-input {
          width: 100%;
          background: #0A0A0A;
          border: 1px solid var(--border);
          padding: 12px 16px;
          color: var(--fg);
          font-family: var(--font-sans);
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .auth-input:focus {
          outline: none;
          border-color: var(--fg);
        }

        .auth-btn {
          width: 100%;
          background: var(--fg);
          color: var(--bg);
          border: none;
          padding: 14px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .auth-btn:hover:not(:disabled) { opacity: 0.8; }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-google-btn {
          width: 100%;
          background: #0A0A0A;
          color: var(--fg);
          border: 1px solid var(--border);
          padding: 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .auth-google-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          color: var(--muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 32px;
        }

        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }

        .auth-divider span { padding: 0 16px; }

        .auth-toggle {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--muted);
        }

        .auth-toggle button {
          background: none;
          border: none;
          color: var(--fg);
          font-size: 13px;
          cursor: pointer;
          margin-left: 8px;
          text-decoration: underline;
        }

        .auth-error {
          border: 1px solid #EF4444;
          color: #EF4444;
          padding: 12px;
          font-size: 13px;
          margin-bottom: 24px;
          text-align: center;
        }
      `}</style>

      <div className="page-container">
        <nav>
          <a href="/" className="nav-logo">Snapd</a>
        </nav>

        <main className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Welcome.</h1>
            <p className="auth-sub">
              {isSignIn ? 'Sign in to access your orders.' : 'Create an account to manage your formulas.'}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <button 
              type="button" 
              className="auth-google-btn" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Sign Up')}
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
      </div>
    </>
  )
}
