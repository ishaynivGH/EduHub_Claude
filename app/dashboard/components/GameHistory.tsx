'use client'

import { useState, useEffect } from 'react'
import { getGameHistory } from '@/lib/games/gameApi'
import {
  LettersIcon,
  SoundsIcon,
  MissingLetterIcon,
  EliminationIcon,
  SentencesIcon,
  SpeakingIcon,
  MemoryIcon,
} from '@/lib/components/Icons'

interface GameSession {
  id: string
  game_type: string
  score: number
  correct_answers: number
  incorrect_answers: number
  duration_seconds: number
  completed_at: string
}

interface GameHistoryProps {
  profileId: string
}

const GAME_NAMES: Record<string, { icon: React.ComponentType<any>; label: string }> = {
  letters: { icon: LettersIcon, label: 'משחק אותיות' },
  sounds: { icon: SoundsIcon, label: 'משחק צלילים' },
  missing: { icon: MissingLetterIcon, label: 'השלמת מילה' },
  elimination: { icon: EliminationIcon, label: 'משחק הניפוי' },
  sentences: { icon: SentencesIcon, label: 'משחק משפטים' },
  speaking: { icon: SpeakingIcon, label: 'אתגר הדיבור' },
  memory: { icon: MemoryIcon, label: 'משחק הזיכרון' },
}

export default function GameHistory({ profileId }: GameHistoryProps) {
  const [games, setGames] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGameHistory()
  }, [profileId])

  const loadGameHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📜 GameHistory: Loading history for profile:', profileId)
      const response = await getGameHistory(profileId, undefined, 10)
      console.log('📜 GameHistory: Got response with', response.sessions?.length, 'games')
      setGames(response.sessions)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('❌ GameHistory: Error loading game history:', err)
      setError(`Failed to load game history: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('he-IL', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const getAccuracy = (correct: number, incorrect: number) => {
    const total = correct + incorrect
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 היסטוריה אחרונה</h3>
        <div className="text-center text-gray-600">
          <p>Loading recent games...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 היסטוריה אחרונה</h3>
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 היסטוריה אחרונה</h3>
        <div className="text-center text-gray-600">
          <p>No games played yet. Start playing to see your history!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 היסטוריה אחרונה</h3>

      <div className="space-y-3">
        {games.map((game) => {
          const accuracy = getAccuracy(game.correct_answers, game.incorrect_answers)

          return (
            <div
              key={game.id}
              className="flex items-center justify-between bg-gradient-to-r from-pastel-light-blue to-pastel-light-green rounded-2xl p-4 hover:shadow-md transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const gameInfo = GAME_NAMES[game.game_type]
                    const GameIcon = gameInfo?.icon || LettersIcon
                    return <GameIcon className="w-8 h-8 text-pastel-blue" />
                  })()}
                  <div>
                    <p className="font-bold text-gray-800">
                      {GAME_NAMES[game.game_type]?.label || game.game_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(game.completed_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Score */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">ניקוד</p>
                  <p className="text-3xl font-bold text-pastel-green">{game.score}</p>
                </div>

                {/* Accuracy */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">דיוק</p>
                  <p className="text-2xl font-bold text-pastel-blue">{accuracy}%</p>
                </div>

                {/* Duration */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">זמן</p>
                  <p className="text-lg font-bold text-pastel-orange">
                    {formatDuration(game.duration_seconds)}
                  </p>
                </div>

                {/* Correct/Incorrect */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">תוצאות</p>
                  <p className="text-lg font-bold">
                    <span className="text-pastel-green">{game.correct_answers}✓</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-pastel-red">{game.incorrect_answers}✗</span>
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
