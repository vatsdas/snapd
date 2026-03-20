import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCustomerOrdersWithItems } from '@/lib/orders'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
})

type OrdersResponseOk = {
  data: Awaited<ReturnType<typeof getCustomerOrdersWithItems>>
  error: null
}
type OrdersResponseError = { data: null; error: string }

/** Returns orders (with nested items) for a given customer UUID. */
export async function GET(
  _req: Request,
  context: { params: Promise<{ customerId: string }> | { customerId: string } },
) {
  const params = await context.params
  const parsed = paramsSchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json<OrdersResponseError>(
      { data: null, error: 'Invalid customerId' },
      { status: 400 },
    )
  }

  try {
    const orders = await getCustomerOrdersWithItems(parsed.data.customerId)
    return NextResponse.json<OrdersResponseOk>({ data: orders, error: null })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch orders', error)
    return NextResponse.json<OrdersResponseError>(
      { data: null, error: 'Failed to fetch orders' },
      { status: 500 },
    )
  }
}

