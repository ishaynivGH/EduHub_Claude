import { createClient } from '@supabase/supabase-js'

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Create admin client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabase
}

export function getUserIdFromToken(authHeader: string | null): string | null {
  console.log('🔐 getUserIdFromToken: authHeader provided?', !!authHeader)

  if (!authHeader) {
    console.error('❌ getUserIdFromToken: No auth header provided')
    return null
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.error('❌ getUserIdFromToken: Auth header does not start with "Bearer "')
    console.error('   Header value:', authHeader.substring(0, 50))
    return null
  }

  try {
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('✅ getUserIdFromToken: Extracted token')
    console.log('🔑 Token length:', token.length)
    console.log('🔑 Token starts with:', token.substring(0, 20))

    const parts = token.split('.')
    console.log('📦 Token parts count:', parts.length)

    if (parts.length !== 3) {
      console.error('❌ getUserIdFromToken: Invalid token format, expected 3 parts separated by dots')
      console.error('   Part 0 length:', parts[0]?.length)
      console.error('   Part 1 length:', parts[1]?.length)
      console.error('   Part 2 length:', parts[2]?.length)
      return null
    }

    // Decode the payload (second part)
    console.log('🔓 getUserIdFromToken: Decoding JWT payload...')
    console.log('   Payload (base64) starts with:', parts[1].substring(0, 20))

    let decodedString: string
    try {
      decodedString = Buffer.from(parts[1], 'base64').toString('utf-8')
      console.log('✅ getUserIdFromToken: Successfully decoded base64')
      console.log('   Decoded string:', decodedString)
    } catch (decodeError) {
      console.error('❌ getUserIdFromToken: Failed to decode base64:', decodeError)
      throw decodeError
    }

    let payload: any
    try {
      payload = JSON.parse(decodedString)
      console.log('✅ getUserIdFromToken: Successfully parsed JSON')
      console.log('   Payload keys:', Object.keys(payload))
    } catch (parseError) {
      console.error('❌ getUserIdFromToken: Failed to parse JSON:', parseError)
      throw parseError
    }

    const userId = payload.sub
    console.log('✅ getUserIdFromToken: Extracted user ID:', userId)

    if (!userId) {
      console.error('❌ getUserIdFromToken: No "sub" claim in JWT payload')
      return null
    }

    return userId
  } catch (error) {
    console.error('💥 getUserIdFromToken: Unexpected error:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    }
    return null
  }
}
