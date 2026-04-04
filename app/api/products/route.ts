import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase'
import type { Products } from '@/types/database'

export const dynamic = 'force-dynamic'

/** Returns all in-stock products. */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('in_stock', true)

    if (error) {
      // 1. Better error logging to console
      console.error('[Supabase Admin Query Error]:', error)
      
      // 3. Return full error in development
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message || JSON.stringify(error) 
        : 'Failed to fetch products'

      return NextResponse.json(
        { data: null, error: errorMessage, fullError: process.env.NODE_ENV === 'development' ? error : undefined },
        { status: 500 },
      )
    }

    return NextResponse.json<{ data: Products[]; error: null }>({
      data: data ?? [],
      error: null,
    })
  } catch (error) {
    console.error('Failed to fetch products (Server Error):', error)
    
    const errorMessage = process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error)) 
        : 'Failed to fetch products'

    return NextResponse.json(
      { data: null, error: errorMessage, fullError: process.env.NODE_ENV === 'development' ? error : undefined },
      { status: 500 },
    )
  }
}

