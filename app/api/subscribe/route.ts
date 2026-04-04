import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createSubscriptionCheckout } from '@/lib/subscribe'

const bodySchema = z.object({
  customer_email: z.string().email(),
  customer_name: z.string().min(1).optional(),
  plan: z.enum(['monthly', 'yearly']).optional().default('monthly'),
})

type SubscribeResponseOk = { data: { url: string }; error: null }
type SubscribeResponseError = { data: null; error: string }

const SUBSCRIPTION_PRICE_MONTHLY = 'price_1TIOwtAHswlzabd4H4DFi5nE'
const SUBSCRIPTION_PRICE_YEARLY = 'price_1TIOx3AHswlzabd4lfFa6tNb'

/** Creates a Stripe Checkout Session for subscriptions. */
export async function POST(req: Request) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json<SubscribeResponseError>(
      { data: null, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json<SubscribeResponseError>(
      { data: null, error: 'Invalid request body' },
      { status: 400 },
    )
  }

  try {
    const priceId = parsed.data.plan === 'yearly' ? SUBSCRIPTION_PRICE_YEARLY : SUBSCRIPTION_PRICE_MONTHLY
    
    const result = await createSubscriptionCheckout({
      customerEmail: parsed.data.customer_email,
      customerName: parsed.data.customer_name,
      priceId: priceId,
    })

    return NextResponse.json<SubscribeResponseOk>({
      data: { url: result.url },
      error: null,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Subscribe failed', error)
    return NextResponse.json<SubscribeResponseError>(
      { data: null, error: 'Failed to create subscription checkout session' },
      { status: 500 },
    )
  }
}

