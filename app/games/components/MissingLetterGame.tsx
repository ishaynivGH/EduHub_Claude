'use client'

import { useState, useEffect } from 'react'
import { VOCABULARY, shuffleArray, getRandomWrongLetters } from '@/lib/games/gameData'
import { speakText, playSound } from '@/lib/games/gameUtils'
import { useGameStore } from '@/lib/games/gameStore'

interface GameProps {
  onGameEnd: (finalScore: number) => void
  onBack: () => void
}

interface RoundData {
  item: typeof VOCABULARY[0]
  wordLower: string
  missingPosition: number
  missingLetter: string
  options: string[]
}

export default function MissingLetterGame({ onGameEnd, onBack }: GameProps) {
  const store = useGameStore()
  const [roundData, setRoundData] = useState<RoundData | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    store.startGame('missing')
    generateRound()
  }, [])

  const generateRound = async () => {
    setIsLoading(true)
    setIsAnswered(false)
    setFeedback('')

    try {
      // Select random vocabulary item
      const randomVocab = shuffleArray(VOCABULARY)
      const item = randomVocab[0]

      // Convert word to lowercase for consistent handling
      const wordLower = item.word.toLowerCase()

      // Pick a random position to remove a letter
      const missingPosition = Math.floor(Math.random() * wordLower.length)

      // Get the actual missing letter from the word
      const missingLetter = wordLower[missingPosition].toUpperCase()

      // Generate wrong letter options, ensuring no duplicates
      let wrongLetters = getRandomWrongLetters(item.letter, 3)

      // Remove duplicates if the missing letter is already in wrong letters
      wrongLetters = wrongLetters.filter(letter => letter !== missingLetter)

      // If we lost a letter due to deduplication, add another wrong letter
      while (wrongLetters.length < 3) {
        const newWrongLetter = getRandomWrongLetters(item.letter, 1)[0]
        if (newWrongLetter !== missingLetter && !wrongLetters.includes(newWrongLetter)) {
          wrongLetters.push(newWrongLetter)
        }
      }

      // Create options array with the missing letter and wrong letters (guaranteed unique)
      const allOptions = shuffleArray([missingLetter, ...wrongLetters])

      setRoundData({
        item,
        wordLower,
        missingPosition,
        missingLetter,
        options: allOptions,
      })

      // Speak the word
      await speakText(item.word)
    } catch (error) {
      console.error('Error generating round:', error)
    }

    setIsLoading(false)
  }

  const getMissingLetterDisplay = (): string => {
    if (!roundData) return ''

    const { wordLower, missingPosition } = roundData

    // Build display: part before + underscore + part after
    const beforeMissing = wordLower.substring(0, missingPosition)
    const afterMissing = wordLower.substring(missingPosition + 1)

    return beforeMissing + '_' + afterMissing
  }

  const handleAnswer = async (selectedLetter: string) => {
    if (isAnswered || isLoading || !roundData) return

    setIsAnswered(true)
    const isCorrect = selectedLetter === roundData.missingLetter

    if (isCorrect) {
      playSound('correct')
      setFeedback(`✅ נכון! ${roundData.item.word}`)
      store.incrementCorrect()
      store.incrementStreak()
      store.addScore(1)
      setTimeout(generateRound, 1500)
    } else {
      playSound('wrong')
      setFeedback(`❌ טעות! הטיב נכון הוא ${roundData.missingLetter}`)
      store.incrementIncorrect()
      store.resetStreak()
      setTimeout(generateRound, 2000)
    }
  }

  if (!roundData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl font-bold">טוען...</p>
      </div>
    )
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-pastel-light-green via-white to-pastel-light-blue p-4"
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
          <h2 className="text-2xl font-bold text-pastel-green">השלם מילה</h2>
          <div className="text-2xl font-bold text-pastel-green">ניקוד: {store.score}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center">
        {/* Word Display */}
        <div
          dir="ltr"
          className="text-6xl font-bold mb-8 text-pastel-green font-mono tracking-widest"
        >
          {getMissingLetterDisplay()}
        </div>

        <div className="text-7xl mb-8 animate-bounce">{roundData.item.emoji}</div>

        {/* Action Button */}
        <button
          onClick={() => speakText(roundData.item.word)}
          disabled={isAnswered || isLoading}
          className="mb-8 bg-pastel-green text-white font-bold py-4 px-8 rounded-3xl text-2xl hover:opacity-90 disabled:opacity-50 transition"
        >
          🔊 הקשיבו שוב
        </button>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 w-full mb-6">
          {roundData.options.map((letter) => (
            <button
              key={letter}
              onClick={() => handleAnswer(letter)}
              disabled={isAnswered}
              className={`game-option-button py-4 px-6 text-4xl font-bold rounded-2xl transition transform hover:scale-105 active:scale-95 ${
                isAnswered
                  ? letter === roundData.missingLetter
                    ? 'bg-pastel-green text-white'
                    : 'bg-gray-300 text-gray-600'
                  : 'bg-white border-2 border-pastel-green text-pastel-green hover:bg-pastel-light-green active:bg-pastel-green active:text-white'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {feedback && <div className="text-2xl font-bold text-center mb-6">{feedback}</div>}
      </div>

      {/* Stats */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4 mt-6">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-gray-600 text-sm">תשובות נכונות</p>
            <p className="text-3xl font-bold text-pastel-green">{store.correctAnswers}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">רצף</p>
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
