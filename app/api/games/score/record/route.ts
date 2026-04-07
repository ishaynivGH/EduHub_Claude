import { createServerClient, getUserIdFromToken } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    const userId = getUserIdFromToken(authHeader)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerClient()

    const body = await request.json()
    const {
      sessionId,
      profileId,
      gameType,
      roundNumber,
      questionText,
      userAnswer,
      isCorrect,
      pointsEarned = 0,
      responseTimeMs,
    } = body

    if (!sessionId || !profileId || !gameType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 403 }
      )
    }

    // Record the score
    const { data: score, error: scoreError } = await supabase
      .from('game_scores')
      .insert({
        session_id: sessionId,
        user_id: userId,
        profile_id: profileId,
        game_type: gameType,
        round_number: roundNumber,
        question_text: questionText,
        user_answer: userAnswer,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        response_time_ms: responseTimeMs,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (scoreError) {
      return NextResponse.json(
        { error: 'Failed to record score', details: scoreError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      scoreId: score.id,
      message: 'Score recorded',
    })
  } catch (error) {
    console.error('Error recording score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
