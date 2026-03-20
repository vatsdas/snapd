import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createCheckout } from '@/lib/checkout'

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  customer_email: z.string().email().optional(),
  customer_id: z.string().optional(),
})

type CheckoutResponseOk = { data: { url: string }; error: null }
type CheckoutResponseError = { data: null; error: string }

/** Creates a Stripe Checkout Session for one-time payments. */
export async function POST(req: Request) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json<CheckoutResponseError>(
      { data: null, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json<CheckoutResponseError>(
      { data: null, error: 'Invalid request body' },
      { status: 400 },
    )
  }

  try {
    const result = await createCheckout({
      items: parsed.data.items,
      customerEmail: parsed.data.customer_email,
      customerId: parsed.data.customer_id,
    })

    return NextResponse.json<CheckoutResponseOk>({
      data: { url: result.checkoutUrl },
      error: null,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Checkout failed', error)
    return NextResponse.json<CheckoutResponseError>(
      { data: null, error: `Failed to create checkout session: ${String((error as any).message || error)}` },
      { status: 500 },
    )
  }
}

