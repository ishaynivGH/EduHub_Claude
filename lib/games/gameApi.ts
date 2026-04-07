// Game API client utilities

interface GameSessionResponse {
  success: boolean
  sessionId: string
  message: string
}

interface GameCompletionResponse {
  success: boolean
  sessionId: string
  score: number
  durationSeconds: number
  message: string
}

interface GameScoreResponse {
  success: boolean
  scoreId: string
  message: string
}

interface GameHistoryResponse {
  success: boolean
  sessions: any[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

interface GameStatsResponse {
  success: boolean
  stats: {
    totalGames: number
    totalScore: number
    averageScore: number
    totalCorrect: number
    totalIncorrect: number
    totalDuration: number
    gameTypeStats: Record<string, any>
    bestScore: number
    recentGames: any[]
  }
}

// Get auth token from supabase
async function getAuthToken(): Promise<string | null> {
  try {
    console.log('🔑 getAuthToken: Importing supabase...')
    const { supabase } = await import('@/lib/supabase')
    console.log('🔑 getAuthToken: Getting session...')

    const { data, error } = await supabase.auth.getSession()

    console.log('🔑 getAuthToken: Session data:', data)
    console.log('🔑 getAuthToken: Session error:', error)
    console.log('🔑 getAuthToken: Session present?', !!data.session)
    console.log('🔑 getAuthToken: Token present?', !!data.session?.access_token)

    if (!data.session) {
      console.warn('⚠️ getAuthToken: No session found - user may not be logged in')
      return null
    }

    const token = data.session.access_token
    console.log('✅ getAuthToken: Got token, length:', token.length)
    return token
  } catch (error) {
    console.error('❌ getAuthToken: Exception:', error)
    if (error instanceof Error) {
      console.error('❌ getAuthToken: Error message:', error.message)
    }
    return null
  }
}

// Start a new game session
export async function startGameSession(
  gameType: string,
  profileId: string,
  difficulty: string = 'normal'
): Promise<GameSessionResponse> {
  console.log('🎮 Starting game session:', { gameType, profileId, difficulty })

  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('/api/games/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        gameType,
        profileId,
        difficulty,
      }),
    })

    console.log('📡 API Response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', error)
      throw new Error(error.error || 'Failed to start game session')
    }

    const data = await response.json()
    console.log('✅ Game session started:', data)
    return data
  } catch (error) {
    console.error('💥 Network error:', error)
    throw error
  }
}

// Complete a game session
export async function completeGameSession(
  sessionId: string,
  score: number,
  correctAnswers: number,
  incorrectAnswers: number,
  streak: number
): Promise<GameCompletionResponse> {
  console.log('🏁 Completing game session:', { sessionId, score, correctAnswers, incorrectAnswers, streak })

  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch('/api/games/session/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        score,
        correctAnswers,
        incorrectAnswers,
        streak,
      }),
    })

    console.log('📡 API Response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ API Error:', error)
      throw new Error(error.error || 'Failed to complete game session')
    }

    const data = await response.json()
    console.log('✅ Game session completed:', data)
    return data
  } catch (error) {
    console.error('💥 Network error:', error)
    throw error
  }
}

// Record individual game score
export async function recordGameScore(
  sessionId: string,
  profileId: string,
  gameType: string,
  roundNumber: number,
  questionText: string,
  userAnswer: string,
  isCorrect: boolean,
  pointsEarned: number,
  responseTimeMs?: number
): Promise<GameScoreResponse> {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/games/score/record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      sessionId,
      profileId,
      gameType,
      roundNumber,
      questionText,
      userAnswer,
      isCorrect,
      pointsEarned,
      responseTimeMs,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to record score')
  }

  return response.json()
}

// Get game history
export async function getGameHistory(
  profileId?: string,
  gameType?: string,
  limit: number = 50,
  offset: number = 0
): Promise<GameHistoryResponse> {
  console.log('📜 getGameHistory: Starting...')
  const token = await getAuthToken()

  if (!token) {
    console.error('❌ getGameHistory: No token - user not authenticated')
    throw new Error('Not authenticated')
  }

  console.log('✅ getGameHistory: Got token')

  const params = new URLSearchParams()
  if (profileId) params.append('profileId', profileId)
  if (gameType) params.append('gameType', gameType)
  params.append('limit', limit.toString())
  params.append('offset', offset.toString())

  const url = `/api/games/history?${params.toString()}`
  console.log('🌐 getGameHistory: Calling', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  console.log('📡 getGameHistory: Response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    console.error('❌ getGameHistory: API error:', error)
    throw new Error(error.error || 'Failed to fetch game history')
  }

  const data = await response.json()
  console.log('✅ getGameHistory: Success, got', data.sessions?.length, 'sessions')
  return data
}

// Get game statistics
export async function getGameStats(
  profileId?: string
): Promise<GameStatsResponse> {
  console.log('📊 getGameStats: Starting...')
  const token = await getAuthToken()

  if (!token) {
    console.error('❌ getGameStats: No token - user not authenticated')
    throw new Error('Not authenticated')
  }

  console.log('✅ getGameStats: Got token')

  const params = new URLSearchParams()
  if (profileId) params.append('profileId', profileId)

  const url = `/api/games/stats?${params.toString()}`
  console.log('🌐 getGameStats: Calling', url)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  console.log('📡 getGameStats: Response status:', response.status)

  if (!response.ok) {
    const error = await response.json()
    console.error('❌ getGameStats: API error:', error)
    throw new Error(error.error || 'Failed to fetch game stats')
  }

  const data = await response.json()
  console.log('✅ getGameStats: Success', data)
  return data
}
