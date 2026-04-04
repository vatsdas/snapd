import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  cancelSubscriptionById,
  getCustomerSubscriptions,
} from '@/lib/subscribe'
import { supabaseAdmin } from '@/lib/supabase'

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

/** Returns subscriptions (with product details) for a given auth user UUID. */
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
    // Resolve the Supabase Auth user ID to their email
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(parsed.data.customerId)
    if (authError || !authUser?.user?.email) {
      console.error('[Subscriptions API] Failed to resolve auth user', authError)
      return NextResponse.json<SubscriptionsResponseOk>({ data: [], error: null })
    }

    // Look up the internal customer record by email
    const { data: customer, error: custError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', authUser.user.email)
      .maybeSingle()

    if (custError) throw custError

    if (!customer) {
      // No customer record yet — return empty
      return NextResponse.json<SubscriptionsResponseOk>({ data: [], error: null })
    }

    const subscriptions = await getCustomerSubscriptions(customer.id)
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

