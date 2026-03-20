import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: orders, error: oError } = await supabaseAdmin.from('orders').select('*')
  const { data: items, error: iError } = await supabaseAdmin.from('order_items').select('*')

  return NextResponse.json({
    orders,
    oError,
    items,
    iError
  })
}
