'use client'

import { useState, useEffect } from 'react'
import { getGameStats } from '@/lib/games/gameApi'
import {
  LettersIcon,
  SoundsIcon,
  MissingLetterIcon,
  EliminationIcon,
  SentencesIcon,
  SpeakingIcon,
  MemoryIcon,
} from '@/lib/components/Icons'

interface GameTypeStats {
  played: number
  totalScore: number
  averageScore: number
  bestScore: number
}

interface Stats {
  totalGames: number
  totalScore: number
  averageScore: number
  totalCorrect: number
  totalIncorrect: number
  totalDuration: number
  gameTypeStats: Record<string, GameTypeStats>
  bestScore: number
}

interface GameStatsProps {
  profileId: string
}

const GAME_NAMES: Record<string, { icon: React.ComponentType<any>; label: string }> = {
  letters: { icon: LettersIcon, label: 'אותיות' },
  sounds: { icon: SoundsIcon, label: 'צלילים' },
  missing: { icon: MissingLetterIcon, label: 'השלמה' },
  elimination: { icon: EliminationIcon, label: 'ניפוי' },
  sentences: { icon: SentencesIcon, label: 'משפטים' },
  speaking: { icon: SpeakingIcon, label: 'דיבור' },
  memory: { icon: MemoryIcon, label: 'זיכרון' },
}

export default function GameStats({ profileId }: GameStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGameStats()
  }, [profileId])

  const loadGameStats = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📊 GameStats: Loading stats for profile:', profileId)
      const response = await getGameStats(profileId)
      console.log('📊 GameStats: Got response:', response)
      setStats(response.stats)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('❌ GameStats: Error loading game stats:', err)
      setError(`Failed to load game stats: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getAccuracy = (correct: number, incorrect: number) => {
    const total = correct + incorrect
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 סטטיסטיקה כללית</h3>
        <div className="text-center text-gray-600">
          <p>Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 סטטיסטיקה כללית</h3>
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 סטטיסטיקה כללית</h3>
        <div className="text-center text-gray-600">
          <p>No games played yet. Play some games to see your statistics!</p>
        </div>
      </div>
    )
  }

  const accuracy = getAccuracy(stats.totalCorrect, stats.totalIncorrect)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-8">📈 סטטיסטיקה כללית</h3>

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {/* Total Games */}
        <div className="bg-gradient-to-br from-pastel-light-blue to-pastel-light-purple rounded-2xl p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">סה"כ משחקים</p>
          <p className="text-4xl font-black text-pastel-blue">{stats.totalGames}</p>
          <p className="text-xs text-gray-500 mt-2">
            {formatDuration(stats.totalDuration)} זמן כולל
          </p>
        </div>

        {/* Total Score */}
        <div className="bg-gradient-to-br from-pastel-light-green to-pastel-light-blue rounded-2xl p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">ניקוד כולל</p>
          <p className="text-4xl font-black text-pastel-green">{stats.totalScore}</p>
          <p className="text-xs text-gray-500 mt-2">
            ממוצע: {stats.averageScore} לכל משחק
          </p>
        </div>

        {/* Best Score */}
        <div className="bg-gradient-to-br from-pastel-light-orange to-pastel-light-green rounded-2xl p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">הניקוד הגבוה</p>
          <p className="text-4xl font-black text-pastel-orange">{stats.bestScore}</p>
          <p className="text-xs text-gray-500 mt-2">🏆 הישג מרשים</p>
        </div>

        {/* Accuracy */}
        <div className="bg-gradient-to-br from-pastel-light-purple to-pastel-light-orange rounded-2xl p-6 text-center">
          <p className="text-gray-600 text-sm mb-2">דיוק כללי</p>
          <p className="text-4xl font-black text-pastel-purple">{accuracy}%</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalCorrect}✓ / {stats.totalIncorrect}✗
          </p>
        </div>
      </div>

      {/* Game Type Breakdown */}
      {Object.keys(stats.gameTypeStats).length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-gray-800 mb-6">📊 ביצוע לפי משחק</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.gameTypeStats).map(([gameType, gameStats]) => {
              const gameInfo = GAME_NAMES[gameType]
              const GameIcon = gameInfo?.icon || LettersIcon
              return (
              <div
                key={gameType}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GameIcon className="w-8 h-8 text-pastel-blue" />
                    <p className="font-bold text-gray-800">{gameInfo?.label || gameType}</p>
                  </div>
                  <span className="bg-pastel-blue text-white px-3 py-1 rounded-full text-sm font-bold">
                    x{gameStats.played}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 text-sm">ממוצע:</p>
                    <p className="font-bold text-pastel-green">{gameStats.averageScore}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 text-sm">הגבוה:</p>
                    <p className="font-bold text-pastel-orange">{gameStats.bestScore}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pastel-blue to-pastel-green h-2 rounded-full transition-all"
                        style={{
                          width: `${(gameStats.averageScore / stats.bestScore) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
