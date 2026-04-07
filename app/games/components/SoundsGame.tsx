'use client'

import { useState, useEffect } from 'react'
import { VOCABULARY, shuffleArray, getRandomWrongLetters } from '@/lib/games/gameData'
import { speakText, playSound } from '@/lib/games/gameUtils'
import { useGameStore } from '@/lib/games/gameStore'

interface SoundsGameProps {
  onGameEnd: (finalScore: number) => void
  onBack: () => void
}

export default function SoundsGame({ onGameEnd, onBack }: SoundsGameProps) {
  const store = useGameStore()
  const [currentItem, setCurrentItem] = useState(VOCABULARY[0])
  const [options, setOptions] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    store.startGame('sounds')
    generateRound()
  }, [])

  const generateRound = async () => {
    setIsLoading(true)
    setIsAnswered(false)
    setFeedback('')

    const randomVocab = shuffleArray(VOCABULARY)
    const item = randomVocab[0]
    setCurrentItem(item)

    const wrongLetters = getRandomWrongLetters(item.letter, 3)
    const allOptions = shuffleArray([item.letter, ...wrongLetters])
    setOptions(allOptions)

    // Speak the word instead of letter
    await speakText(item.word)
    setIsLoading(false)
  }

  const handleAnswer = async (selectedLetter: string) => {
    if (isAnswered || isLoading) return

    setIsAnswered(true)
    const isCorrect = selectedLetter === currentItem.letter

    if (isCorrect) {
      playSound('correct')
      setFeedback(`✅ נכון! ${currentItem.word} מתחיל ב ${currentItem.letter}`)
      store.incrementCorrect()
      store.incrementStreak()
      store.addScore(1)

      if (store.consecutiveCorrect >= 5) {
        setTimeout(() => onGameEnd(store.score), 2000)
      } else {
        setTimeout(generateRound, 1500)
      }
    } else {
      playSound('wrong')
      setFeedback(`❌ טעות! ${currentItem.word} מתחיל ב ${currentItem.letter}`)
      store.incrementIncorrect()
      store.resetStreak()
      setTimeout(generateRound, 2000)
    }
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green p-4"
    >
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-4">
          <button
            onClick={onBack}
            className="bg-pastel-red text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            ← חזור
          </button>
          <h2 className="text-2xl font-bold text-pastel-blue">צליל פותח</h2>
          <div className="text-2xl font-bold text-pastel-green">ניקוד: {store.score}</div>
        </div>
      </div>

      <div className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center">
        <div className="text-7xl font-bold mb-8 animate-bounce">{currentItem.emoji}</div>

        <button
          onClick={() => speakText(currentItem.word)}
          disabled={isAnswered || isLoading}
          className="mb-8 bg-pastel-green text-white font-bold py-4 px-8 rounded-3xl text-2xl hover:opacity-90 disabled:opacity-50"
        >
          🔊 הקשיבו שוב
        </button>

        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          {options.map((letter) => (
            <button
              key={letter}
              onClick={() => handleAnswer(letter)}
              disabled={isAnswered}
              className={`game-option-button py-4 px-6 text-4xl font-bold rounded-2xl transition transform hover:scale-105 active:scale-95 ${
                isAnswered
                  ? letter === currentItem.letter
                    ? 'bg-pastel-green text-white'
                    : 'bg-gray-300'
                  : 'bg-white border-2 border-pastel-blue hover:bg-pastel-light-blue active:bg-pastel-blue active:text-white'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {feedback && <div className="text-2xl font-bold text-center mb-6">{feedback}</div>}
      </div>
    </div>
  )
}
