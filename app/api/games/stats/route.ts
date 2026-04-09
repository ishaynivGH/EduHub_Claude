import { createServerClient, getUserIdFromToken } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('\n========== STATS API CALLED ==========')
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
    console.log('🎯 Profile ID:', profileId)

    let query = supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null) // Only completed games

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    console.log('🔍 Executing query...')
    const { data: sessions, error: sessionsError } = await query

    if (sessionsError) {
      console.error('❌ Query error:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch game stats', details: sessionsError.message },
        { status: 500 }
      )
    }

    console.log('✅ Query successful, sessions found:', sessions?.length || 0)

    // Calculate statistics
    const stats = {
      totalGames: sessions.length,
      totalScore: 0,
      averageScore: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalDuration: 0,
      gameTypeStats: {} as Record<string, any>,
      bestScore: 0,
      recentGames: sessions.slice(0, 5),
    }

    sessions.forEach((session) => {
      stats.totalScore += session.score
      stats.totalCorrect += session.correct_answers
      stats.totalIncorrect += session.incorrect_answers
      stats.totalDuration += session.duration_seconds || 0
      stats.bestScore = Math.max(stats.bestScore, session.score)

      // Game type specific stats
      if (!stats.gameTypeStats[session.game_type]) {
        stats.gameTypeStats[session.game_type] = {
          played: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
        }
      }

      stats.gameTypeStats[session.game_type].played += 1
      stats.gameTypeStats[session.game_type].totalScore += session.score
      stats.gameTypeStats[session.game_type].bestScore = Math.max(
        stats.gameTypeStats[session.game_type].bestScore,
        session.score
      )
    })

    // Calculate averages
    if (stats.totalGames > 0) {
      stats.averageScore = Math.round(stats.totalScore / stats.totalGames)
    }

    // Calculate game type averages
    Object.keys(stats.gameTypeStats).forEach((gameType) => {
      const count = stats.gameTypeStats[gameType].played
      stats.gameTypeStats[gameType].averageScore = Math.round(
        stats.gameTypeStats[gameType].totalScore / count
      )
    })

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('💥 Unhandled error in stats API:', error)
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
