'use client'

import Nav from '@/components/Nav'

export default function Privacy() {
  return (
    <>
      <style>{`
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .legal-page {
          flex: 1;
          max-width: 720px;
          margin: 0 auto;
          padding: 160px 64px 80px;
          width: 100%;
        }

        .legal-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--teal);
          margin-bottom: 16px;
        }

        .legal-title {
          font-family: var(--font-serif);
          font-size: 48px;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .legal-updated {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 64px;
        }

        .legal-section {
          margin-bottom: 48px;
        }

        .legal-section h2 {
          font-family: var(--font-serif);
          font-size: 24px;
          margin-bottom: 16px;
        }

        .legal-section p,
        .legal-section li {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.8;
        }

        .legal-section ul {
          list-style: disc;
          padding-left: 24px;
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legal-contact {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.8;
        }

        .legal-contact a {
          color: var(--teal);
          text-decoration: underline;
        }

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

        @media (max-width: 768px) {
          .legal-page {
            padding: 120px 24px 48px;
          }
          .legal-title {
            font-size: 32px;
          }
          .legal-section h2 {
            font-size: 20px;
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

        <main className="legal-page">
          <div className="legal-label">Legal</div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: April 2026</p>

          <section className="legal-section">
            <h2>Information We Collect</h2>
            <p>When you create an account or make a purchase, we collect the following information:</p>
            <ul>
              <li>Email address (used for account authentication and order confirmations)</li>
              <li>Payment information (processed and stored exclusively by Stripe — we never see or store your full card details)</li>
              <li>Order history (products purchased, dates, and amounts)</li>
              <li>Account preferences and subscription status</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>How We Use Your Data</h2>
            <p>Your personal information is used solely to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Manage your account and subscriptions</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Improve our products and services</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>We Never Sell Your Data</h2>
            <p>We do not sell, rent, or share your personal information with third parties for marketing purposes. Your data is yours — we only use it to provide you with our services.</p>
          </section>

          <section className="legal-section">
            <h2>Third-Party Services</h2>
            <p>We use the following trusted third-party services to operate Snapd:</p>
            <ul>
              <li><strong>Stripe</strong> — Handles all payment processing. Stripe is PCI-DSS Level 1 certified, the highest level of payment security. Your payment data is stored and processed entirely by Stripe and never touches our servers.</li>
              <li><strong>Supabase</strong> — Stores your account data, order history, and subscription records. All data is encrypted at rest and in transit.</li>
              <li><strong>Vercel</strong> — Hosts our website. No personal data is stored on Vercel&apos;s infrastructure.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Data Retention</h2>
            <p>We retain your account and order data for as long as your account is active. If you wish to delete your account and all associated data, please contact us and we will process your request within 30 days.</p>
          </section>

          <section className="legal-section">
            <h2>Contact Us</h2>
            <p className="legal-contact">If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:privacy@snapd.com">privacy@snapd.com</a>.</p>
          </section>
        </main>

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
