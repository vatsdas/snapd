import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { supabaseAdmin } from './supabase'
import type { ProductsInsert } from '../types/database'

const productsToInsert: ProductsInsert[] = [
  {
    name: 'Original Mild',
    scent: 'original',
    intensity: 'mild',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Original Medium',
    scent: 'original',
    intensity: 'medium',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Original Extreme',
    scent: 'original',
    intensity: 'extreme',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Icy Rush Mild',
    scent: 'icy_rush',
    intensity: 'mild',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Icy Rush Medium',
    scent: 'icy_rush',
    intensity: 'medium',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Icy Rush Extreme',
    scent: 'icy_rush',
    intensity: 'extreme',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Inferno Medium',
    scent: 'inferno',
    intensity: 'medium',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Inferno Extreme',
    scent: 'inferno',
    intensity: 'extreme',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Focus Mild',
    scent: 'focus',
    intensity: 'mild',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Focus Medium',
    scent: 'focus',
    intensity: 'medium',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Calm Sharp Mild',
    scent: 'calm_sharp',
    intensity: 'mild',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Calm Sharp Medium',
    scent: 'calm_sharp',
    intensity: 'medium',
    type: 'starter',
    price_cents: 599,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: 'Single Refill',
    scent: 'any',
    intensity: 'any' as unknown as ProductsInsert['intensity'],
    type: 'refill',
    price_cents: 299,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
  {
    name: '3-Pack Refill',
    scent: 'any',
    intensity: 'any' as unknown as ProductsInsert['intensity'],
    type: 'bundle',
    price_cents: 799,
    stripe_price_id: '',
    description: '',
    in_stock: true,
  },
]

/** Inserts the app’s initial product catalog into Supabase. */
export async function seed() {
  const results: Array<{
    input: ProductsInsert
    insertedId?: string
    error?: unknown
  }> = []

  for (const product of productsToInsert) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(product)
      .select('id,name,scent,intensity,type,price_cents,created_at')
      .single()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error inserting product', { product, error })
      results.push({ input: product, error })
      continue
    }

    // eslint-disable-next-line no-console
    console.log('Inserted product', data)
    results.push({ input: product, insertedId: data.id })
  }

  return results
}

async function main() {
  await seed()
}

if (require.main === module) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed script failed', error)
    process.exitCode = 1
  })
}

