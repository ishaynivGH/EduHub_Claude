'use client'

import { useState, useEffect } from 'react'
import { VOCABULARY, shuffleArray, getRandomWrongLetters } from '@/lib/games/gameData'
import { speakText, playSound } from '@/lib/games/gameUtils'
import { useGameStore } from '@/lib/games/gameStore'

interface LettersGameProps {
  onGameEnd: (finalScore: number) => void
  onBack: () => void
}

export default function LettersGame({ onGameEnd, onBack }: LettersGameProps) {
  const store = useGameStore()
  const [currentItem, setCurrentItem] = useState(VOCABULARY[0])
  const [options, setOptions] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [showBonus, setShowBonus] = useState(false)
  const [bonusItem, setBonusItem] = useState<typeof VOCABULARY[0] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    store.startGame('letters')
    generateRound()
  }, [])

  const generateRound = async () => {
    setIsLoading(true)
    setIsAnswered(false)
    setFeedback('')

    const randomVocab = shuffleArray(VOCABULARY)
    const item = randomVocab[0]
    setCurrentItem(item)

    // Generate options: correct letter + 3 random wrong letters
    const wrongLetters = getRandomWrongLetters(item.letter, 3)
    const allOptions = shuffleArray([item.letter, ...wrongLetters])
    setOptions(allOptions)

    // Speak the letter
    await speakText(item.letter, true)
    setIsLoading(false)
  }

  const handleAnswer = async (selectedLetter: string) => {
    if (isAnswered || isLoading) return

    setIsAnswered(true)
    const isCorrect = selectedLetter === currentItem.letter

    if (isCorrect) {
      playSound('correct')
      setFeedback(`✅ נכון! ${currentItem.word}`)
      store.incrementCorrect()
      store.incrementStreak()
      store.addScore(1)

      // Check for bonus (5 consecutive correct)
      if (store.consecutiveCorrect >= 5) {
        setShowBonus(true)
        const bonusVocab = shuffleArray(VOCABULARY)[0]
        setBonusItem(bonusVocab)
        await speakText(bonusVocab.word)
      } else {
        setTimeout(generateRound, 1500)
      }
    } else {
      playSound('wrong')
      setFeedback(`❌ טעות! זה ${currentItem.letter} (${currentItem.word})`)
      store.incrementIncorrect()
      store.resetStreak()
      setTimeout(generateRound, 2000)
    }
  }

  const handleBonusAnswer = async (selectedLetter: string) => {
    if (!bonusItem) return

    const isCorrect = selectedLetter === bonusItem.letter

    if (isCorrect) {
      playSound('bonus')
      setFeedback('⭐ בונוס! +5 נקודות!')
      store.addScore(5)
      store.resetStreak()
      setShowBonus(false)
      setTimeout(generateRound, 2000)
    } else {
      playSound('wrong')
      setFeedback('❌ טעות בשאלת הבונוס')
      store.resetStreak()
      setShowBonus(false)
      setTimeout(generateRound, 2000)
    }
  }

  const bonusOptions = showBonus && bonusItem
    ? shuffleArray([bonusItem.letter, ...getRandomWrongLetters(bonusItem.letter, 3)])
    : []

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green p-4"
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
          <h2 className="text-2xl font-bold text-pastel-blue">משחק אותיות</h2>
          <div className="text-2xl font-bold text-pastel-green">
            ניקוד: <span className="text-3xl">{store.score}</span>
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center">
        {!showBonus ? (
          <>
            {/* Letter Display */}
            <div className="text-7xl font-bold mb-8 animate-bounce text-pastel-blue">
              {currentItem.emoji}
            </div>

            {/* Action Button */}
            <button
              onClick={() => speakText(currentItem.letter, true)}
              disabled={isAnswered || isLoading}
              className="mb-8 bg-pastel-green text-white font-bold py-4 px-8 rounded-3xl text-2xl hover:opacity-90 disabled:opacity-50 transition"
            >
              🔊 הקשיבו שוב
            </button>

            {/* Options */}
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
                        : 'bg-gray-300 text-gray-600'
                      : 'bg-white border-2 border-pastel-blue text-pastel-blue hover:bg-pastel-light-blue active:bg-pastel-blue active:text-white'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="text-2xl font-bold text-center mb-6 h-16 flex items-center">
                {feedback}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Bonus Round */}
            <div className="bg-gradient-to-br from-pastel-light-orange to-pastel-light-green rounded-3xl p-8 w-full text-center mb-8">
              <h3 className="text-3xl font-black mb-4 text-pastel-orange">⭐ שאלת בונוס! ⭐</h3>
              <p className="text-xl mb-6 text-gray-700">
                הקשיבו למילה ובחרו את אות ההתחלה הנכונה
              </p>

              <div className="text-7xl mb-8 animate-bounce">
                {bonusItem?.emoji}
              </div>

              <button
                onClick={() => bonusItem && speakText(bonusItem.word)}
                className="mb-8 bg-pastel-blue text-white font-bold py-3 px-6 rounded-2xl text-lg hover:opacity-90"
              >
                🔊 השמע מילה
              </button>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {bonusOptions.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleBonusAnswer(letter)}
                    className="py-4 px-6 text-4xl font-bold rounded-2xl bg-white border-2 border-pastel-orange text-pastel-orange hover:bg-pastel-light-orange transition"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {feedback && (
                <div className="text-2xl font-bold text-center">
                  {feedback}
                </div>
              )}
            </div>
          </>
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
