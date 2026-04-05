'use client'

import Nav from '@/components/Nav'

export default function Terms() {
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
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-updated">Last updated: April 2026</p>

          <section className="legal-section">
            <h2>Use of Service</h2>
            <p>By accessing or using the Snapd website and purchasing our products, you agree to be bound by these Terms of Service. Snapd products are intended for adults aged 18 and older. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section className="legal-section">
            <h2>Payment Terms</h2>
            <p>All payments are processed securely through Stripe. Prices are listed in USD and include applicable taxes at checkout. By completing a purchase, you authorize us to charge the payment method provided for the total order amount.</p>
          </section>

          <section className="legal-section">
            <h2>Refund Policy</h2>
            <p>All sales are final. We do not offer refunds or exchanges except in cases where a product is confirmed to be defective upon arrival. If you receive a defective product, please contact us within 14 days of delivery with photographic evidence, and we will issue a full refund or replacement at our discretion.</p>
          </section>

          <section className="legal-section">
            <h2>Subscription Cancellation</h2>
            <p>You may cancel your subscription at any time through your account dashboard. Upon cancellation:</p>
            <ul>
              <li>Your subscription remains active until the end of the current billing period</li>
              <li>You will not be charged for subsequent billing periods</li>
              <li>No partial refunds are issued for unused portions of the current billing period</li>
              <li>You may resubscribe at any time at the then-current pricing</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Limitation of Liability</h2>
            <p>Snapd and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or services. Our total liability for any claim shall not exceed the amount paid by you for the product or service giving rise to the claim.</p>
          </section>

          <section className="legal-section">
            <h2>Governing Law</h2>
            <p>These Terms of Service shall be governed by and construed in accordance with the laws of the United States. Any disputes arising under these terms shall be resolved in the federal or state courts located within the United States.</p>
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
