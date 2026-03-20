import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  cancelSubscriptionById,
  getCustomerSubscriptions,
} from '@/lib/subscribe'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
})

const deleteBodySchema = z.object({
  subscription_id: z.string().min(1),
})

type SubscriptionsResponseOk = {
  data: Awaited<ReturnType<typeof getCustomerSubscriptions>>
  error: null
}
type SubscriptionsResponseError = { data: null; error: string }
type CancelResponseOk = { data: { message: string }; error: null }

/** Returns subscriptions (with product details) for a given customer UUID. */
export async function GET(
  _req: Request,
  context: { params: Promise<{ customerId: string }> | { customerId: string } },
) {
  const params = await context.params
  const parsed = paramsSchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json<SubscriptionsResponseError>(
      { data: null, error: 'Invalid customerId' },
      { status: 400 },
    )
  }

  try {
    const subscriptions = await getCustomerSubscriptions(
      parsed.data.customerId,
    )
    return NextResponse.json<SubscriptionsResponseOk>({
      data: subscriptions,
      error: null,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch subscriptions', error)
    return NextResponse.json<SubscriptionsResponseError>(
      { data: null, error: 'Failed to fetch subscriptions' },
      { status: 500 },
    )
  }
}

/** Cancels a Stripe subscription at period end and updates Supabase. */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ customerId: string }> | { customerId: string } },
) {
  const params = await context.params
  const paramsParsed = paramsSchema.safeParse(params)

  if (!paramsParsed.success) {
    return NextResponse.json<SubscriptionsResponseError>(
      { data: null, error: 'Invalid customerId' },
      { status: 400 },
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json<SubscriptionsResponseError>(
      { data: null, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const bodyParsed = deleteBodySchema.safeParse(json)
  if (!bodyParsed.success) {
    return NextResponse.json<SubscriptionsResponseError>(
      { data: null, error: 'Invalid request body' },
      { status: 400 },
    )
  }

  try {
    await cancelSubscriptionById(bodyParsed.data.subscription_id)
    return NextResponse.json<CancelResponseOk>({
      data: { message: 'Subscription cancelled' },
      error: null,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to cancel subscription', error)
    return NextResponse.json<SubscriptionsResponseError>(
      { data: null, error: 'Failed to cancel subscription' },
      { status: 500 },
    )
  }
}

