import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import type { Products, Subscriptions } from '@/types/database'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

/** Creates a Stripe subscription Checkout Session for a customer email. */
export async function createSubscriptionCheckout({
  customerEmail,
  customerName,
  priceId,
}: {
  customerEmail: string
  customerName?: string
  priceId: string
}): Promise<{ url: string; stripeSessionId: string; stripeCustomerId: string }> {
  const { data: existingCustomer, error: lookupError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('email', customerEmail)
    .maybeSingle()

  if (lookupError) throw lookupError

  let stripeCustomerId = existingCustomer?.stripe_customer_id ?? ''

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: customerEmail,
      ...(customerName ? { name: customerName } : {}),
    })

    stripeCustomerId = stripeCustomer.id

    if (existingCustomer) {
      const { error: updateError } = await supabaseAdmin
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('email', customerEmail)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: customerEmail,
          full_name: customerName ?? '',
          stripe_customer_id: stripeCustomerId,
        })
      if (insertError) throw insertError
    }
  }

  const baseUrl = requiredEnv('NEXT_PUBLIC_URL')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/shop`,
  })

  if (!session.url) {
    throw new Error('Stripe session created without a URL')
  }

  return {
    url: session.url,
    stripeSessionId: session.id,
    stripeCustomerId,
  }
}

export type SubscriptionWithProduct = Subscriptions & {
  product: Pick<Products, 'name' | 'scent' | 'intensity'>
}

/** Fetches a customer’s subscriptions and joins product summary fields. */
export async function getCustomerSubscriptions(
  customerId: string,
): Promise<SubscriptionWithProduct[]> {
  const { data: subs, error: subsError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customerId)

  if (subsError) throw subsError

  if (!subs || subs.length === 0) {
    return []
  }

  const productIds = Array.from(
    new Set(subs.map((s) => s.product_id)),
  )

  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, scent, intensity')
    .in('id', productIds)

  if (productsError) throw productsError

  const productById = new Map<string, Products>(
    (products ?? []).map((p) => [p.id, p as Products]),
  )

  return subs.map((sub) => {
    const product = productById.get(sub.product_id)
    return {
      ...sub,
      product: product
        ? {
          name: product.name,
          scent: product.scent,
          intensity: product.intensity,
        }
        : { name: '', scent: '', intensity: 'mild' },
    }
  })
}

/** Cancels a Stripe subscription at period end and marks it cancelled in Supabase. */
export async function cancelSubscriptionById(subscriptionId: string) {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) throw error
}

