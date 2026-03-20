import { supabaseAdmin } from './lib/supabase'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

async function main() {
  const { data, error } = await supabaseAdmin.from('orders').select('*')
  console.log('Orders:', JSON.stringify(data, null, 2))
  console.log('Error:', error)
  
  const { data: items } = await supabaseAdmin.from('order_items').select('*')
  console.log('Order Items:', JSON.stringify(items, null, 2))
}

main()
