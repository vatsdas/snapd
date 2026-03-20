import { NextResponse } from 'next/server'

import { handleStripeWebhook } from '@/lib/stripe-webhook'

// Stripe requires the raw request body for signature verification.
// This `config` shape is used by Next.js Pages Router; it is harmless here and
// included per project convention / requirement.
export const config = { api: { bodyParser: false } }

/** Receives and verifies Stripe webhooks, then updates Supabase accordingly. */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature')

    const result = await handleStripeWebhook({
      rawBody,
      stripeSignature: signature,
    })

    if ('error' in result.body) {
      return NextResponse.json(
        { data: null, error: result.body.error },
        { status: result.status },
      )
    }

    return NextResponse.json(
      { data: result.body, error: null },
      { status: result.status },
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Stripe webhook handler failed', error)
    return NextResponse.json(
      { data: null, error: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}

