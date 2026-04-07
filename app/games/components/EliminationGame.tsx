'use client'

import { useState, useEffect, useRef } from 'react'
import { VOCABULARY, shuffleArray, getRandomWrongLetters } from '@/lib/games/gameData'
import { speakText, playSound } from '@/lib/games/gameUtils'
import { useGameStore } from '@/lib/games/gameStore'

interface GameProps {
  onGameEnd: (finalScore: number) => void
  onBack: () => void
}

interface LetterWithPosition {
  letter: string
  id: string
  isDragging: boolean
  x: number
  y: number
}

export default function EliminationGame({ onGameEnd, onBack }: GameProps) {
  const store = useGameStore()
  const [currentItem, setCurrentItem] = useState(VOCABULARY[0])
  const [activeLetters, setActiveLetters] = useState<LetterWithPosition[]>([])
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dragRefMap = useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const dragDataMap = useRef<Map<string, { startX: number; startY: number; startTime: number }>>(new Map())

  useEffect(() => {
    store.startGame('elimination')
    generateRound()
  }, [])

  const generateRound = async () => {
    setIsLoading(true)
    setIsAnswered(false)
    setFeedback('')

    const randomVocab = shuffleArray(VOCABULARY)
    const item = randomVocab[0]
    setCurrentItem(item)

    // Generate 13 letters (1 correct + 12 wrong)
    const wrongLetters = getRandomWrongLetters(item.letter, 12)
    const allLetters = shuffleArray([item.letter, ...wrongLetters])

    const lettersWithPosition = allLetters.map((letter, index) => ({
      letter,
      id: `${letter}-${index}`,
      isDragging: false,
      x: 0,
      y: 0,
    }))
    setActiveLetters(lettersWithPosition)

    // Speak the letter
    await speakText(item.letter, true)
    setIsLoading(false)
  }

  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    if (isAnswered || isLoading) return
    const touch = e.touches[0]
    dragDataMap.current.set(id, {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    })
  }

  const handleTouchMove = (id: string, e: React.TouchEvent) => {
    if (isAnswered || isLoading) return
    const touch = e.touches[0]
    const dragData = dragDataMap.current.get(id)
    if (!dragData) return

    const deltaX = touch.clientX - dragData.startX
    const deltaY = touch.clientY - dragData.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Visual feedback: scale and opacity based on drag distance
    const ref = dragRefMap.current.get(id)
    if (ref) {
      const opacity = Math.max(0.3, 1 - distance / 150)
      const scale = Math.max(0.7, 1 - distance / 300)
      ref.style.opacity = opacity.toString()
      ref.style.transform = `scale(${scale}) translateX(${deltaX * 0.5}px) translateY(${deltaY * 0.5}px)`
    }
  }

  const handleTouchEnd = (letterObj: LetterWithPosition, e: React.TouchEvent) => {
    const dragData = dragDataMap.current.get(letterObj.id)
    if (!dragData || isAnswered || isLoading) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - dragData.startX
    const deltaY = touch.clientY - dragData.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const timeTaken = Date.now() - dragData.startTime

    // Reset visual state
    const ref = dragRefMap.current.get(letterObj.id)
    if (ref) {
      ref.style.opacity = '1'
      ref.style.transform = 'scale(1) translateX(0) translateY(0)'
    }

    // Require minimum swipe distance (80px) and reasonable speed
    const minDistance = 80
    const isSwipe = distance > minDistance && timeTaken < 500

    if (!isSwipe) {
      dragDataMap.current.delete(letterObj.id)
      return
    }

    // Check if letter is correct
    const isCorrect = letterObj.letter === currentItem.letter
    const remaining = activeLetters.filter(l => l.id !== letterObj.id)

    if (isCorrect) {
      // Player swiped the correct letter - lose!
      playSound('wrong')
      setFeedback(`❌ פסול! זרקתם את האות הנכונה ${currentItem.letter}`)
      store.incrementIncorrect()
      store.resetStreak()
      setActiveLetters(remaining)
      setIsAnswered(true)
      setTimeout(generateRound, 2500)
    } else {
      // Player swiped a wrong letter - correct!
      setActiveLetters(remaining)
      playSound('correct')

      if (remaining.length === 1) {
        // Only correct letter remains - win!
        playSound('bonus')
        setFeedback(`🎉 מעולה! נשארה רק האות הנכונה!`)
        store.incrementCorrect()
        store.incrementStreak()
        store.addScore(1)
        setIsAnswered(true)
        setTimeout(generateRound, 2000)
      }
    }

    dragDataMap.current.delete(letterObj.id)
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-pastel-light-orange via-white to-pastel-light-blue p-4"
    >
      {/* Header */}
      <div className="w-full max-w-3xl mb-6">
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-4">
          <button
            onClick={onBack}
            className="bg-pastel-red text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            ← חזור
          </button>
          <h2 className="text-2xl font-bold text-pastel-orange">משחק הניפוי</h2>
          <div className="text-2xl font-bold text-pastel-green">ניקוד: {store.score}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl flex-grow flex flex-col items-center justify-center">
        {/* Word Display */}
        <div className="text-7xl font-bold mb-8 animate-bounce">{currentItem.emoji}</div>

        {/* Action Button */}
        <button
          onClick={() => speakText(currentItem.letter, true)}
          disabled={isLoading}
          className="mb-8 bg-pastel-orange text-white font-bold py-4 px-8 rounded-3xl text-2xl hover:opacity-90 disabled:opacity-50 transition"
        >
          🔊 הקשיבו שוב
        </button>

        <p className="text-xl font-bold text-gray-700 mb-6 text-center">
          סחפו את האותיות השגויות כדי להעלים אותן!
        </p>

        {/* Letters Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 w-full mb-8">
          {activeLetters.map((letterObj) => (
            <button
              key={letterObj.id}
              ref={(el) => {
                if (el) dragRefMap.current.set(letterObj.id, el)
              }}
              onTouchStart={(e) => handleTouchStart(letterObj.id, e)}
              onTouchMove={(e) => handleTouchMove(letterObj.id, e)}
              onTouchEnd={(e) => handleTouchEnd(letterObj, e)}
              disabled={isAnswered}
              className="game-option-button aspect-square text-3xl font-bold rounded-xl transition-all
                bg-white border-3 border-pastel-orange text-pastel-orange
                hover:bg-pastel-light-orange active:bg-pastel-orange active:text-white disabled:opacity-50
                cursor-grab active:cursor-grabbing select-none"
              style={{ touchAction: 'none' }}
            >
              {letterObj.letter}
            </button>
          ))}
        </div>

        {/* Remaining Count */}
        <div className="text-2xl font-bold text-gray-700 mb-6">
          נשאר: <span className="text-pastel-orange text-3xl">{activeLetters.length}</span>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-2xl font-bold text-center mb-6 h-16 flex items-center">
            {feedback}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-4 mt-6">
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
