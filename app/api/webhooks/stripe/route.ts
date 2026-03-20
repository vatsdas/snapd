import { NextResponse } from 'next/server'

import { handleStripeWebhook } from '@/lib/stripe-webhook'

/** Receives and verifies Stripe webhooks, then updates Supabase accordingly. */
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') ?? ''

    const result = await handleStripeWebhook({
      rawBody: body,
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

