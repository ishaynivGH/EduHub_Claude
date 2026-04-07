import { createServerClient, getUserIdFromToken } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('\n========== START GAME SESSION API CALLED ==========')

    // Get user from Authorization header
    console.log('🔐 Checking authorization header...')
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Authorization header present?', !!authHeader)
    if (authHeader) {
      console.log('🔐 Header value (first 50 chars):', authHeader.substring(0, 50))
    }

    const userId = getUserIdFromToken(authHeader)
    console.log('👤 User ID extracted:', userId)

    if (!userId) {
      console.error('❌ No user ID - auth failed')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', userId)

    const supabase = await createServerClient()

    const body = await request.json()
    const { gameType, profileId, difficulty = 'normal' } = body

    if (!gameType || !profileId) {
      return NextResponse.json(
        { error: 'Missing gameType or profileId' },
        { status: 400 }
      )
    }

    // Verify profile belongs to user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile not found for user:', { profileId, userId, error: profileError })
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 403 }
      )
    }

    console.log('✅ Profile verified:', profileId)

    // Create game session
    console.log('📝 Creating game session:', { userId, profileId, gameType })
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        profile_id: profileId,
        game_type: gameType,
        difficulty,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError) {
      console.error('❌ Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create game session', details: sessionError.message },
        { status: 500 }
      )
    }

    console.log('✅ Game session created:', session.id)
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      message: 'Game session started',
    })
  } catch (error) {
    console.error('💥 Uncaught error in startGameSession:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
      console.error('   Stack:', error.stack)
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
