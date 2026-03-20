import { supabaseAdmin } from '@/lib/supabase'
import type { OrderItems, Orders, Products } from '@/types/database'

export type OrderItemWithProduct = OrderItems & {
  product: Pick<Products, 'name' | 'scent' | 'intensity'>
}

export type OrderWithItems = Orders & {
  items: OrderItemWithProduct[]
}

/** Fetches a customer’s orders and nests order items with product details. */
export async function getCustomerOrdersWithItems(
  customerId: string,
): Promise<OrderWithItems[]> {
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (ordersError) {
    throw ordersError
  }

  if (!orders || orders.length === 0) {
    return []
  }

  const orderIds = orders.map((o) => o.id)

  const { data: orderItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) {
    throw itemsError
  }

  const productIds = Array.from(
    new Set((orderItems ?? []).map((i) => i.product_id)),
  )

  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, name, scent, intensity')
    .in('id', productIds)

  if (productsError) {
    throw productsError
  }

  const productById = new Map<string, Products>(
    (products ?? []).map((p) => [p.id, p as Products]),
  )

  const itemsByOrderId = new Map<string, OrderItemWithProduct[]>()

  for (const item of orderItems ?? []) {
    const product = productById.get(item.product_id)
    if (!product) continue

    const withProduct: OrderItemWithProduct = {
      ...item,
      product: {
        name: product.name,
        scent: product.scent,
        intensity: product.intensity,
      },
    }

    const existing = itemsByOrderId.get(item.order_id) ?? []
    existing.push(withProduct)
    itemsByOrderId.set(item.order_id, existing)
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) ?? [],
  }))
}

