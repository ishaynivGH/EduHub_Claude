import { createServerClient, getUserIdFromToken } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== HISTORY API CALLED ==========')
    console.log('🔐 Checking authorization header...')

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Authorization header present?', !!authHeader)
    if (authHeader) {
      console.log('🔐 Header value (first 50 chars):', authHeader.substring(0, 50))
    }

    const userId = getUserIdFromToken(authHeader)
    console.log('👤 User ID from token:', userId)

    if (!userId) {
      console.error('❌ No user ID found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ Creating Supabase client')
    const supabase = await createServerClient()
    console.log('✅ Supabase client created')

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const profileId = searchParams.get('profileId')
    const gameType = searchParams.get('gameType')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    console.log('🎯 Query params:', { profileId, gameType, limit, offset })

    let query = supabase
      .from('game_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    if (gameType) {
      query = query.eq('game_type', gameType)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    console.log('🔍 Executing query...')
    const { data: sessions, error: sessionsError, count } = await query

    if (sessionsError) {
      console.error('❌ Query error:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch game history', details: sessionsError.message },
        { status: 500 }
      )
    }

    console.log('✅ Query successful, sessions found:', sessions?.length || 0)

    return NextResponse.json({
      success: true,
      sessions,
      pagination: {
        total: count,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('💥 Unhandled error in history API:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
