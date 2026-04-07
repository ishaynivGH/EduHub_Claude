'use client'

import { useState, useEffect } from 'react'
import { VOCABULARY, shuffleArray } from '@/lib/games/gameData'
import { speakText, playSound, startListening, stopListening } from '@/lib/games/gameUtils'
import { useGameStore } from '@/lib/games/gameStore'

interface GameProps {
  onGameEnd: (finalScore: number) => void
  onBack: () => void
}

export default function SpeakingGame({ onGameEnd, onBack }: GameProps) {
  const store = useGameStore()
  const [currentItem, setCurrentItem] = useState(VOCABULARY[0])
  const [feedback, setFeedback] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    store.startGame('speaking')
    generateRound()
  }, [])

  const generateRound = async () => {
    setIsLoading(true)
    setIsListening(false)
    setFeedback('')
    setRetries(0)

    const randomVocab = shuffleArray(VOCABULARY)
    const item = randomVocab[0]
    setCurrentItem(item)

    // Speak the word
    await speakText(item.word)
    setIsLoading(false)
  }

  const handleStartListening = async () => {
    if (isListening || isLoading) return

    setIsListening(true)
    setFeedback('🎤 מאזין... דברו עכשיו')

    await startListening(
      (transcript) => {
        // Check if spoken word matches
        const cleanedTranscript = transcript.trim().toLowerCase()
        const targetWord = currentItem.word.toLowerCase()

        const isCorrect = cleanedTranscript.includes(targetWord) || targetWord.includes(cleanedTranscript)

        if (isCorrect) {
          playSound('correct')
          setFeedback(`✅ כן! ${currentItem.word} נכון!`)
          store.incrementCorrect()
          store.incrementStreak()
          store.addScore(1)
          setIsListening(false)

          if (store.consecutiveCorrect >= 5) {
            setTimeout(() => onGameEnd(store.score), 2000)
          } else {
            setTimeout(generateRound, 1500)
          }
        } else {
          playSound('wrong')
          setFeedback(`❌ טעות! צריך להגיד: ${currentItem.word}`)
          store.incrementIncorrect()
          store.resetStreak()
          setIsListening(false)
          setRetries(prev => prev + 1)

          if (retries >= 2) {
            setTimeout(generateRound, 2000)
          } else {
            setTimeout(() => setFeedback(`${2 - retries} ניסיונות נותרים`), 500)
          }
        }
      },
      (error) => {
        setFeedback(`❌ שגיאה במיקרופון: ${error}`)
        setIsListening(false)
        setRetries(prev => prev + 1)

        if (retries >= 2) {
          setTimeout(generateRound, 2000)
        }
      }
    )
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-pastel-light-purple via-white to-pastel-light-blue p-4"
    >
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-4">
          <button
            onClick={onBack}
            className="bg-pastel-red text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            ← חזור
          </button>
          <h2 className="text-2xl font-bold text-pastel-blue">אתגר הדיבור</h2>
          <div className="text-2xl font-bold text-pastel-green">ניקוד: {store.score}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center">
        {/* Word Display */}
        <div className="text-8xl font-bold mb-8 animate-bounce">{currentItem.emoji}</div>

        <p className="text-2xl font-bold text-gray-700 mb-8 text-center">
          דברו את המילה:
        </p>

        <p className="text-5xl font-bold text-pastel-blue mb-12">
          {currentItem.word}
        </p>

        {/* Listening Button */}
        <button
          onClick={handleStartListening}
          disabled={isLoading || isListening}
          className={`mb-8 font-bold py-6 px-10 rounded-3xl text-2xl transition transform hover:scale-110 ${
            isListening
              ? 'bg-pastel-red text-white animate-pulse'
              : 'bg-pastel-blue text-white hover:opacity-90'
          } disabled:opacity-50`}
        >
          <span className="text-4xl mr-3">{isListening ? '🎤' : '🔊'}</span>
          {isListening ? 'מאזין...' : 'לחצו ודברו'}
        </button>

        {/* Instructions */}
        <div className="bg-pastel-light-blue rounded-2xl p-6 mb-6 text-center w-full">
          <p className="text-gray-700 mb-2">1️⃣ לחצו על הכפתור</p>
          <p className="text-gray-700 mb-2">2️⃣ דברו בבירור</p>
          <p className="text-gray-700">3️⃣ אפשרו גישה למיקרופון</p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-2xl font-bold text-center mb-6 h-20 flex items-center justify-center">
            {feedback}
          </div>
        )}

        {/* Retries */}
        {retries > 0 && retries < 3 && (
          <div className="text-lg font-bold text-pastel-orange">
            {3 - retries} ניסיונות נותרים
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4 mt-6">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-gray-600 text-sm">תשובות נכונות</p>
            <p className="text-3xl font-bold text-pastel-green">{store.correctAnswers}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">סטריק</p>
            <p className="text-3xl font-bold text-pastel-blue">{store.consecutiveCorrect}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">טעויות</p>
            <p className="text-3xl font-bold text-pastel-red">{store.incorrectAnswers}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
