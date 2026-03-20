import { createStripeProducts } from '../lib/stripe'

async function main() {
  await createStripeProducts()
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })

