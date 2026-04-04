import type Stripe from 'stripe'

import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function toIsoFromUnixSeconds(seconds: number): string {
  return new Date(seconds * 1000).toISOString()
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): 'active' | 'cancelled' | 'past_due' | 'paused' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'paused':
      return 'paused'
    case 'canceled':
      return 'cancelled'
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'past_due'
    default: {
      // Exhaustive guard; Stripe may add statuses.
      return 'past_due'
    }
  }
}

async function findOrCreateCustomerInSupabase({
  email,
  name,
  stripeCustomerId,
}: {
  email: string
  name?: string | null
  stripeCustomerId?: string | null
}): Promise<{ stripeCustomerId: string }> {
  const { data: existing, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) throw error

  let finalStripeCustomerId = stripeCustomerId ?? existing?.stripe_customer_id ?? ''

  if (!finalStripeCustomerId) {
    const created = await stripe.customers.create({
      email,
      ...(name ? { name } : {}),
    })
    finalStripeCustomerId = created.id
  }

  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from('customers').insert({
      email,
      full_name: name ?? '',
      stripe_customer_id: finalStripeCustomerId,
    })
    if (insertError) throw insertError
  } else if (!existing.stripe_customer_id && finalStripeCustomerId) {
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        stripe_customer_id: finalStripeCustomerId,
        ...(name ? { full_name: name } : {}),
      })
      .eq('id', existing.id)
    if (updateError) throw updateError
  }

  return { stripeCustomerId: finalStripeCustomerId }
}

/** Verifies a Stripe webhook signature and applies side effects in Supabase. */
export async function handleStripeWebhook({
  rawBody,
  stripeSignature,
}: {
  rawBody: string
  stripeSignature: string | null
}): Promise<{ status: number; body: { ok: true } | { error: string } }> {
  if (!stripeSignature) {
    return { status: 400, body: { error: 'Missing stripe-signature header' } }
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature,
      requiredEnv('STRIPE_WEBHOOK_SECRET'),
    )
  } catch {
    return { status: 400, body: { error: 'Invalid webhook signature' } }
  }

  // eslint-disable-next-line no-console
  console.log('Stripe webhook event', event.type)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const { error: orderError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('stripe_session_id', session.id)

      if (orderError) throw orderError

      const email =
        session.customer_details?.email ?? session.customer_email ?? null
      const name = session.customer_details?.name ?? null
      const stripeCustomerId =
        typeof session.customer === 'string' ? session.customer : null

      if (email) {
        await findOrCreateCustomerInSupabase({
          email,
          name,
          stripeCustomerId,
        })
      }

      return { status: 200, body: { ok: true } }
    }

    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription & { current_period_end: number }
      const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : null

      if (!stripeCustomerId) {
        console.error('[Webhook] customer.subscription.created: missing customer ID')
        return { status: 200, body: { ok: true } }
      }

      // Look up the Supabase customer by their stripe_customer_id
      const { data: customer, error: custError } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('stripe_customer_id', stripeCustomerId)
        .maybeSingle()

      if (custError) throw custError

      if (!customer) {
        console.error('[Webhook] customer.subscription.created: no Supabase customer for Stripe ID', stripeCustomerId)
        return { status: 200, body: { ok: true } }
      }

      // Extract price ID from subscription items
      const firstItem = sub.items?.data?.[0]
      const stripePriceId = firstItem?.price?.id ?? ''

      // Resolve to a valid Supabase product UUID (stripe product IDs like 'prod_...' are not UUIDs)
      let productId = ''
      const { data: matchedProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('stripe_price_id', stripePriceId)
        .maybeSingle()

      if (matchedProduct) {
        productId = matchedProduct.id
      } else {
        // Fallback: use the first product in the catalog
        const { data: fallback } = await supabaseAdmin
          .from('products')
          .select('id')
          .limit(1)
          .single()
        productId = fallback?.id ?? ''
      }

      // Upsert the subscription record
      const { error: upsertError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          customer_id: customer.id,
          product_id: productId,
          stripe_subscription_id: sub.id,
          stripe_price_id: stripePriceId,
          status: mapStripeSubscriptionStatus(sub.status),
          current_period_end: toIsoFromUnixSeconds(sub.current_period_end),
        }, {
          onConflict: 'stripe_subscription_id',
        })

      if (upsertError) {
        console.error('[Webhook] customer.subscription.created: upsert error', upsertError)
        throw upsertError
      }

      console.log('[Webhook] Subscription created in Supabase for customer', customer.id)
      return { status: 200, body: { ok: true } }
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
      const stripeSubscriptionId =
        typeof invoice.subscription === 'string' ? invoice.subscription : null

      if (!stripeSubscriptionId) {
        return { status: 200, body: { ok: true } }
      }

      const lineWithPeriod = invoice.lines.data.find((l) => l.period?.end)
      const periodEndSeconds = lineWithPeriod?.period?.end ?? null

      if (!periodEndSeconds) {
        return { status: 200, body: { ok: true } }
      }

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ current_period_end: toIsoFromUnixSeconds(periodEndSeconds) })
        .eq('stripe_subscription_id', stripeSubscriptionId)

      if (error) throw error

      return { status: 200, body: { ok: true } }
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)

      if (error) throw error

      return { status: 200, body: { ok: true } }
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription & { current_period_end: number }

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: mapStripeSubscriptionStatus(sub.status),
          current_period_end: toIsoFromUnixSeconds(sub.current_period_end),
        })
        .eq('stripe_subscription_id', sub.id)

      if (error) throw error

      return { status: 200, body: { ok: true } }
    }

    default:
      return { status: 200, body: { ok: true } }
  }
}

