import { createServerClient, getUserIdFromToken } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('\n========== COMPLETE GAME SESSION API CALLED ==========')

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
    const {
      sessionId,
      score,
      correctAnswers,
      incorrectAnswers,
      streak,
    } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      )
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('id, started_at')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      console.error('❌ Session not found:', { sessionId, userId, error: sessionError })
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 403 }
      )
    }

    console.log('✅ Session verified:', sessionId)

    // Calculate duration
    const startTime = new Date(session.started_at).getTime()
    const endTime = new Date().getTime()
    const durationSeconds = Math.floor((endTime - startTime) / 1000)

    // Update game session
    console.log('📝 Updating game session:', { sessionId, score, correctAnswers, incorrectAnswers, durationSeconds })
    const { data: updatedSession, error: updateError } = await supabase
      .from('game_sessions')
      .update({
        score: score || 0,
        correct_answers: correctAnswers || 0,
        incorrect_answers: incorrectAnswers || 0,
        streak: streak || 0,
        duration_seconds: durationSeconds,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete game session', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Game session updated successfully:', sessionId)

    // Update user's statistics (increment games played)
    const { data: profileStats } = await supabase
      .from('profiles')
      .select('games_played')
      .eq('id', updatedSession.profile_id)
      .single()

    await supabase
      .from('profiles')
      .update({
        games_played: (profileStats?.games_played || 0) + 1,
      })
      .eq('id', updatedSession.profile_id)

    return NextResponse.json({
      success: true,
      sessionId: updatedSession.id,
      score: updatedSession.score,
      durationSeconds: durationSeconds,
      message: 'Game session completed',
    })
  } catch (error) {
    console.error('💥 Uncaught error in completeGameSession:', error)
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
