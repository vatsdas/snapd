import { NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe'

type CheckoutSessionData = {
  customer_email: string | null
  amount_total: number | null
  payment_status: string
  line_items: Array<{
    description: string | null
    quantity: number | null
    amount_total: number | null
    currency: string | null
  }>
}

type ApiSuccess<T> = { data: T; error: null }
type ApiFailure = { data: null; error: string }

/** Returns a Stripe Checkout Session (expanded with line items) by `session_id`. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json<ApiFailure>(
        { data: null, error: 'Missing session_id' },
        { status: 400 },
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    const lineItems = session.line_items?.data ?? []

    const payload: CheckoutSessionData = {
      customer_email: session.customer_email ?? session.customer_details?.email ?? null,
      amount_total: session.amount_total ?? null,
      payment_status: session.payment_status ?? 'unpaid',
      line_items: lineItems.map((li) => ({
        description: li.description ?? null,
        quantity: li.quantity ?? null,
        amount_total: li.amount_total ?? null,
        currency: li.currency ?? null,
      })),
    }

    return NextResponse.json<ApiSuccess<CheckoutSessionData>>({
      data: payload,
      error: null,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch checkout session', error)
    return NextResponse.json<ApiFailure>(
      { data: null, error: 'Failed to fetch checkout session' },
      { status: 500 },
    )
  }
}

