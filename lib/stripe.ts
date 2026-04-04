import Stripe from 'stripe'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error('Stripe client is server-only')
  }
}

assertServerOnly()

export const stripe = new Stripe(requiredEnv('STRIPE_SECRET_KEY'))

export type CreatedStripeCatalog = {
  starterKit: {
    productId: string
    oneTimePriceId: string
  }
  singleRefill: {
    productId: string
    oneTimePriceId: string
    monthlyPriceId: string
  }
  threePackRefill: {
    productId: string
    oneTimePriceId: string
  }
}

/** Creates Stripe products and prices for the app’s catalog and logs created price IDs. */
export async function createStripeProducts(): Promise<CreatedStripeCatalog> {
  const starterKitProduct = await stripe.products.create({
    name: 'Starter Kit',
    metadata: { tier: 'starter' },
  })
  const starterKitOneTimePrice = await stripe.prices.create({
    product: starterKitProduct.id,
    currency: 'usd',
    unit_amount: 599,
  })

  const singleRefillProduct = await stripe.products.create({
    name: 'Single Refill',
    metadata: { tier: 'refill', pack: '1' },
  })
  const singleRefillOneTimePrice = await stripe.prices.create({
    product: singleRefillProduct.id,
    currency: 'usd',
    unit_amount: 299,
  })
  const singleRefillMonthlyPrice = await stripe.prices.create({
    product: singleRefillProduct.id,
    currency: 'usd',
    unit_amount: 249,
    recurring: { interval: 'month' },
  })

  const threePackRefillProduct = await stripe.products.create({
    name: '3-Pack Refill',
    metadata: { tier: 'bundle', pack: '3' },
  })
  const threePackRefillOneTimePrice = await stripe.prices.create({
    product: threePackRefillProduct.id,
    currency: 'usd',
    unit_amount: 799,
  })

  const created: CreatedStripeCatalog = {
    starterKit: {
      productId: starterKitProduct.id,
      oneTimePriceId: starterKitOneTimePrice.id,
    },
    singleRefill: {
      productId: singleRefillProduct.id,
      oneTimePriceId: singleRefillOneTimePrice.id,
      monthlyPriceId: singleRefillMonthlyPrice.id,
    },
    threePackRefill: {
      productId: threePackRefillProduct.id,
      oneTimePriceId: threePackRefillOneTimePrice.id,
    },
  }

  // eslint-disable-next-line no-console
  console.log('Stripe price IDs (copy these):', {
    starter_one_time: created.starterKit.oneTimePriceId,
    refill_one_time: created.singleRefill.oneTimePriceId,
    refill_monthly: created.singleRefill.monthlyPriceId,
    bundle3_one_time: created.threePackRefill.oneTimePriceId,
  })

  return created
}

