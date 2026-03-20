import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase'
import type { Products } from '@/types/database'

/** Returns all in-stock products. */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('in_stock', true)

    if (error) {
      return NextResponse.json(
        { data: null, error: 'Failed to fetch products' },
        { status: 500 },
      )
    }

    return NextResponse.json<{ data: Products[]; error: null }>({
      data: data ?? [],
      error: null,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch products', error)
    return NextResponse.json(
      { data: null, error: 'Failed to fetch products' },
      { status: 500 },
    )
  }
}

