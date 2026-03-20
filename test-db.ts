import { createCheckout } from './lib/checkout'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

async function main() {
  try {
    await createCheckout({
      items: [{ product_id: '764eaed2-96ca-43bc-8367-96a1a1f33f91', quantity: 1 }],
    })
    console.log('Success!')
  } catch (e) {
    console.error('ERROR DATA:', JSON.stringify(e))
    console.error(e)
  }
}

main()
