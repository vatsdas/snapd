import * as dotenv from 'dotenv'
import { resolve, join } from 'path'

// Load environment variables before doing anything else
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const { stripe } = await import('../lib/stripe')
  console.log('Deploying new Stripe subscription products...')

  // "Monthly Routine" — $14.99/month recurring
  const monthlyProduct = await stripe.products.create({
    name: 'Monthly Routine',
  })
  const monthlyPrice = await stripe.prices.create({
    product: monthlyProduct.id,
    currency: 'usd',
    unit_amount: 1499, // $14.99
    recurring: { interval: 'month' },
  })

  // "Annual Performance" — $119.99/year recurring
  const annualProduct = await stripe.products.create({
    name: 'Annual Performance',
  })
  const annualPrice = await stripe.prices.create({
    product: annualProduct.id,
    currency: 'usd',
    unit_amount: 11999, // $119.99
    recurring: { interval: 'year' },
  })

  console.log('Stripe Price Engine deployed successfully. Generated IDs:')
  console.log('---------------------------------------------------------')
  console.log('Monthly Routine ($14.99/mo):', monthlyPrice.id)
  console.log('Annual Performance ($119.99/yr):', annualPrice.id)
  console.log('---------------------------------------------------------')
}

main().catch(console.error)
