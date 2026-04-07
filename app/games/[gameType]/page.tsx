'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { setupGameAudio } from '@/lib/games/gameUtils'
import { startGameSession, completeGameSession } from '@/lib/games/gameApi'
import { useGameStore } from '@/lib/games/gameStore'
import { useEffect } from 'react'
import LettersGame from '../components/LettersGame'
import SoundsGame from '../components/SoundsGame'
import MissingLetterGame from '../components/MissingLetterGame'
import EliminationGame from '../components/EliminationGame'
import SentencesGame from '../components/SentencesGame'
import SpeakingGame from '../components/SpeakingGame'
import MemoryGame from '../components/MemoryGame'

export default function GamePage() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const gameType = params.gameType as string
  const profileId = searchParams.get('profileId') || ''
  const store = useGameStore()
  const [finalScore, setFinalScore] = useState(0)
  const [showGameOver, setShowGameOver] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSavingGame, setIsSavingGame] = useState(false)

  // Initialize game session
  useEffect(() => {
    setupGameAudio()

    if (session && profileId) {
      initializeGameSession()
    }
  }, [session, profileId])

  // Save game session when user exits (cleanup on unmount or navigation)
  useEffect(() => {
    return () => {
      // This runs when component unmounts (user navigates away)
      if (sessionId && !showGameOver && (store.correctAnswers > 0 || store.incorrectAnswers > 0)) {
        // Auto-save the current game state before leaving
        console.log('💾 Auto-saving game session on exit...')
        // Calculate current score based on correctAnswers
        const currentScore = store.correctAnswers * 10 // Assuming 10 points per correct answer
        completeGameSession(
          sessionId,
          currentScore,
          store.correctAnswers,
          store.incorrectAnswers,
          store.consecutiveCorrect
        ).catch(error => {
          console.error('Failed to auto-save game:', error)
        })
      }
    }
  }, [sessionId, showGameOver, store.correctAnswers, store.incorrectAnswers, store.consecutiveCorrect])

  const initializeGameSession = async () => {
    try {
      console.log('🎮 Initializing game session for:', { gameType, profileId })
      if (!profileId) {
        console.warn('⚠️ No profileId provided!')
        return
      }
      const response = await startGameSession(gameType, profileId)
      console.log('✅ Session created:', response.sessionId)
      setSessionId(response.sessionId)
    } catch (error) {
      console.error('Failed to start game session:', error)
      // Still allow game to continue even if session creation fails
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green">
        <p className="text-2xl text-gray-600">Loading...</p>
      </main>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  const handleGameEnd = async (score: number) => {
    console.log('🏁 Game ended with score:', score)
    console.log('📊 Stats:', { correctAnswers: store.correctAnswers, incorrectAnswers: store.incorrectAnswers })
    setFinalScore(score)
    setShowGameOver(true)

    // Save game completion
    if (sessionId) {
      console.log('💾 Saving game session:', sessionId)
      setIsSavingGame(true)
      try {
        await completeGameSession(
          sessionId,
          score,
          store.correctAnswers,
          store.incorrectAnswers,
          store.consecutiveCorrect
        )
        console.log('✅ Game saved successfully')
      } catch (error) {
        console.error('❌ Failed to save game completion:', error)
        // Game still completed for player, just log the error
      } finally {
        setIsSavingGame(false)
      }
    } else {
      console.warn('⚠️ No sessionId available, game not saved')
    }
  }

  const handleBackToMenu = () => {
    router.push('/games')
  }

  if (showGameOver) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <h2 className="text-4xl font-bold text-pastel-green mb-4">🎉 בחמלה!</h2>
          <p className="text-gray-600 mb-4 text-lg">סיימתם את המשחק</p>

          <div className="bg-gradient-to-r from-pastel-blue to-pastel-green rounded-2xl p-8 mb-8">
            <p className="text-gray-600 text-sm mb-2">הניקוד הסופי שלכם</p>
            <p className="text-6xl font-black text-white">{finalScore}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleBackToMenu}
              className="w-full bg-pastel-blue text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition text-lg"
            >
              ← חזור לתפריט המשחקים
            </button>
            <button
              onClick={() => {
                setShowGameOver(false)
                // Re-mount the game component
                router.refresh()
              }}
              className="w-full bg-pastel-green text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition text-lg"
            >
              שחקו שוב 🔄
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      {gameType === 'letters' && (
        <LettersGame onGameEnd={handleGameEnd} onBack={handleBackToMenu} />
      )}
      {gameType === 'sounds' && (
        <SoundsGame onGameEnd={handleGameEnd} onBack={handleBackToMenu} />
      )}
      {gameType === 'missing' && (
        <MissingLetterGame onGameEnd={handleGameEnd} onBack={handleBackToMenu} />
      )}
      {gameType === 'elimination' && (
        <EliminationGame onGameEnd={handleGameEnd} onBack={handleBackToMenu} />
      )}
      {gameType === 'sentences' && (
        <SentencesGame onGameEnd={handleGameEnd} onBack={handleBackToMenu} />
      )}
      {gameType === 'speaking' && (
        <SpeakingGame onGameEnd={handleGameEnd} onBack={handleBackToMenu} />
      )}
      {gameType === 'memory' && (
        <MemoryGame onGameEnd={handleGameEnd} onBack={handleBackToMenu} />
      )}
    </>
  )
}
