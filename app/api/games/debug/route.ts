import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    console.log('🔍 DEBUG: Auth header present?', !!authHeader)

    if (!authHeader) {
      return NextResponse.json({
        status: 'FAIL',
        reason: 'No authorization header',
        hint: 'Make sure the Authorization header is being sent with the request'
      })
    }

    // Test token extraction
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        status: 'FAIL',
        reason: 'Invalid auth header format',
        hint: 'Header should be "Bearer <token>"'
      })
    }

    const token = authHeader.substring(7)
    const parts = token.split('.')

    if (parts.length !== 3) {
      return NextResponse.json({
        status: 'FAIL',
        reason: 'Invalid JWT format',
        hint: `Expected 3 parts, got ${parts.length}`
      })
    }

    // Try to decode
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )

    console.log('🔍 DEBUG: Decoded payload keys:', Object.keys(payload))
    console.log('🔍 DEBUG: User ID (sub):', payload.sub)

    if (!payload.sub) {
      return NextResponse.json({
        status: 'FAIL',
        reason: 'No sub claim in JWT',
        hint: 'JWT payload should have a "sub" field with user ID'
      })
    }

    // Test Supabase connection
    console.log('🔍 DEBUG: Checking Supabase env vars...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json({
        status: 'FAIL',
        reason: 'Missing NEXT_PUBLIC_SUPABASE_URL',
        hint: 'Check your .env.local file'
      })
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json({
        status: 'FAIL',
        reason: 'Missing SUPABASE_SERVICE_ROLE_KEY',
        hint: 'Check your .env.local file'
      })
    }

    // Try to create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('🔍 DEBUG: Supabase client created successfully')

    // Try a simple query
    const { data, error } = await supabase
      .from('game_sessions')
      .select('count(*)', { count: 'exact' })
      .eq('user_id', payload.sub)

    if (error) {
      console.error('🔍 DEBUG: Query error:', error)
      return NextResponse.json({
        status: 'FAIL',
        reason: 'Supabase query failed',
        error: error.message,
        code: error.code
      })
    }

    return NextResponse.json({
      status: 'OK',
      userId: payload.sub,
      supabaseUrl: supabaseUrl?.substring(0, 20) + '...',
      message: 'All systems operational'
    })
  } catch (error) {
    console.error('🔍 DEBUG: Caught error:', error)
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
