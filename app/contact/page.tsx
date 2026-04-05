'use client'

import { useState, useRef } from 'react'
import Nav from '@/components/Nav'

const SUBJECTS = ['General Question', 'Wholesale', 'Press & Media', 'Other'] as const

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState<string>(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)

  function markTouched(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  function copyEmail() {
    navigator.clipboard.writeText('snapd.co@gmail.com').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send')
      }

      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Email us directly at snapd.co@gmail.com')
    } finally {
      setSending(false)
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

        .contact-layout {
          flex: 1;
          display: grid;
          grid-template-columns: 2fr 3fr;
          padding-top: 100px;
        }

        /* ── LEFT COLUMN ── */
        .contact-left {
          padding: 80px 64px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid var(--border);
        }

        .contact-headline {
          font-family: var(--font-serif);
          font-size: clamp(48px, 5vw, 72px);
          line-height: 1;
          letter-spacing: -1px;
          margin-bottom: 24px;
        }
        .contact-headline em { font-style: italic; }

        .contact-intro {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.7;
          max-width: 400px;
          margin-bottom: 40px;
        }

        .email-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #111111;
          border: 1px solid var(--border);
          padding: 10px 20px;
          border-radius: 100px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 48px;
        }
        .email-pill:hover {
          border-color: rgba(255,255,255,0.3);
          background: #1a1a1a;
        }
        .email-pill-text {
          font-size: 13px;
          color: var(--fg);
          letter-spacing: 0.5px;
        }
        .email-pill-icon {
          width: 14px;
          height: 14px;
          color: var(--muted);
          transition: color 0.2s;
        }
        .email-pill:hover .email-pill-icon { color: var(--fg); }
        .email-pill-copied {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--teal);
          animation: fadeInCopied 0.3s ease;
        }

        @keyframes fadeInCopied {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .info-rows {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 13px;
          color: var(--muted);
        }

        .info-icon {
          width: 16px;
          height: 16px;
          color: var(--teal);
          flex-shrink: 0;
        }

        /* ── RIGHT COLUMN ── */
        .contact-right {
          padding: 80px 64px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 640px;
        }

        .form-group {
          margin-bottom: 36px;
        }

        .form-label {
          display: block;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .form-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          color: var(--fg);
          font-family: var(--font-sans);
          font-size: 15px;
          padding: 12px 0;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-bottom-color: #FFFFFF;
        }
        .form-input.invalid {
          border-bottom-color: #EF4444;
        }
        .form-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        textarea.form-input {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
        }

        .field-error {
          font-size: 11px;
          color: #EF4444;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Subject selector */
        .subject-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .subject-pill {
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.5px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .subject-pill:hover {
          border-color: rgba(255,255,255,0.4);
          color: var(--fg);
        }
        .subject-pill.active {
          background: #FFFFFF;
          color: #0A0A0A;
          border-color: #FFFFFF;
        }

        /* Send button */
        .send-btn {
          width: 100%;
          padding: 18px;
          background: #FFFFFF;
          color: #0A0A0A;
          border: 2px solid #FFFFFF;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.25s;
          margin-top: 12px;
        }
        .send-btn:hover:not(:disabled) {
          background: transparent;
          color: #FFFFFF;
        }
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-error {
          margin-top: 16px;
          padding: 12px;
          border: 1px solid #EF4444;
          color: #EF4444;
          font-size: 13px;
          text-align: center;
        }

        /* ── SUCCESS STATE ── */
        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 24px;
          animation: fadeUp 0.5s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .success-check {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid var(--teal);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-check svg {
          width: 28px;
          height: 28px;
          color: var(--teal);
          animation: drawCheck 0.5s ease 0.2s both;
        }

        @keyframes drawCheck {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
        }

        .success-title {
          font-family: var(--font-serif);
          font-size: 32px;
        }

        .success-sub {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* ── FOOTER ── */
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

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .contact-layout {
            grid-template-columns: 1fr;
          }
          .contact-left {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .contact-right {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .contact-layout {
            padding-top: 80px;
          }
          .contact-left {
            padding: 48px 24px;
          }
          .contact-headline {
            font-size: 40px;
          }
          .contact-right {
            padding: 48px 24px;
          }
          .subject-group {
            gap: 6px;
          }
          .subject-pill {
            font-size: 11px;
            padding: 6px 14px;
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

        <div className="contact-layout">
          {/* Left Column */}
          <div className="contact-left">
            <h1 className="contact-headline">Let&apos;s <em>Talk.</em></h1>
            <p className="contact-intro">
              Whether you have a question, a wholesale inquiry, or just
              want to know more about the science — we read every email.
            </p>

            <button className="email-pill" onClick={copyEmail} type="button">
              {copied ? (
                <span className="email-pill-copied">Copied!</span>
              ) : (
                <>
                  <span className="email-pill-text">snapd.co@gmail.com</span>
                  <svg className="email-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </>
              )}
            </button>

            <div className="info-rows">
              <div className="info-row">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Response time: within 24 hours</span>
              </div>
              <div className="info-row">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span>Wholesale inquiries: welcome</span>
              </div>
              <div className="info-row">
                <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>Press &amp; media: welcome</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="contact-right">
            {sent ? (
              <div className="success-state">
                <div className="success-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="success-title">Message sent.</h2>
                <p className="success-sub">We&apos;ll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className={`form-input${touched.name && !name ? ' invalid' : ''}`}
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => markTouched('name')}
                    required
                  />
                  {touched.name && !name && <div className="field-error">Required</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className={`form-input${touched.email && !email ? ' invalid' : ''}`}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    required
                  />
                  {touched.email && !email && <div className="field-error">Required</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <div className="subject-group">
                    {SUBJECTS.map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`subject-pill${subject === s ? ' active' : ''}`}
                        onClick={() => setSubject(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className={`form-input${touched.message && !message ? ' invalid' : ''}`}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onBlur={() => markTouched('message')}
                    required
                  />
                  {touched.message && !message && <div className="field-error">Required</div>}
                </div>

                <button
                  type="submit"
                  className="send-btn"
                  disabled={sending || !name || !email || !message}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>

                {error && (
                  <div className="form-error">
                    Something went wrong. Email us directly at snapd.co@gmail.com
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

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
