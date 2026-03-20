import type Stripe from 'stripe'

import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import type { OrdersInsert, Products } from '@/types/database'

export type CheckoutItemInput = {
  product_id: string
  quantity: number
}

export type CreateCheckoutResult = {
  checkoutUrl: string
  stripeSessionId: string
  totalCents: number
  products: Products[]
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

/** Creates a Stripe Checkout Session and inserts a pending order in Supabase. */
export async function createCheckout({
  items,
  customerEmail,
  customerId,
}: {
  items: CheckoutItemInput[]
  customerEmail?: string
  customerId?: string
}): Promise<CreateCheckoutResult> {
  const ids = Array.from(new Set(items.map((i) => i.product_id)))

  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('*')
    .in('id', ids)
    .eq('in_stock', true)

  if (productsError) {
    throw productsError
  }

  const productById = new Map<string, Products>(
    (products ?? []).map((p) => [p.id, p]),
  )

  const missing = ids.filter((id) => !productById.has(id))
  if (missing.length > 0) {
    const error = new Error(`Unknown or out-of-stock products: ${missing.join(', ')}`)
    ;(error as Error & { code?: string }).code = 'PRODUCT_NOT_FOUND'
    throw error
  }

  const line_items = items.map((item) => {
    const product = productById.get(item.product_id)
    if (!product) {
      throw new Error(`Missing product: ${item.product_id}`)
    }
    if (!product.stripe_price_id) {
      throw new Error(`Product missing stripe_price_id: ${product.id}`)
    }

    return {
      price: product.stripe_price_id,
      quantity: item.quantity,
    } satisfies NonNullable<Stripe.Checkout.SessionCreateParams['line_items']>[number]
  })

  const totalCents = items.reduce((sum, item) => {
    const product = productById.get(item.product_id)
    if (!product) return sum
    return sum + product.price_cents * item.quantity
  }, 0)

  const baseUrl = requiredEnv('NEXT_PUBLIC_URL')

  if (customerId && customerEmail) {
    const { data: existingCust } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .maybeSingle()

    if (!existingCust) {
      await supabaseAdmin.from('customers').insert({
        id: customerId,
        email: customerEmail,
        full_name: '',
        stripe_customer_id: '',
      } as any)
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/shop`,
    ...(customerEmail ? { customer_email: customerEmail } : {}),
  })

  if (!session.url) {
    throw new Error('Stripe session created without a URL')
  }

  const orderInsert = {
    customer_id: customerId || null,
    stripe_session_id: session.id,
    status: 'pending',
    total_cents: totalCents,
  } as unknown as OrdersInsert

  const { data: newOrder, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert(orderInsert)
    .select('id')
    .single()

  if (orderError) {
    throw orderError
  }

  const orderItemsInsert = items.map((item) => {
    const product = productById.get(item.product_id)!
    return {
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_cents: product.price_cents,
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemsInsert as any)
  if (itemsError) {
    throw itemsError
  }

  return {
    checkoutUrl: session.url,
    stripeSessionId: session.id,
    totalCents,
    products: products ?? [],
  }
}

