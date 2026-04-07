'use client'

import { useState, useEffect } from 'react'
import { VOCABULARY, shuffleArray } from '@/lib/games/gameData'
import { speakText, playSound } from '@/lib/games/gameUtils'
import { useGameStore } from '@/lib/games/gameStore'

interface PictureCard {
  id: string
  word: string
  emoji: string
  letter: string
  matched: boolean
  flipped: boolean
}

interface LetterCard {
  id: string
  letter: string
  pairId: string
  matched: boolean
}

interface GameProps {
  onGameEnd: (finalScore: number) => void
  onBack: () => void
}

export default function MemoryGame({ onGameEnd, onBack }: GameProps) {
  const store = useGameStore()
  const [pictureCards, setPictureCards] = useState<PictureCard[]>([])
  const [letterCards, setLetterCards] = useState<LetterCard[]>([])
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [matchedCount, setMatchedCount] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    store.startGame('memory')
    initializeGame()
  }, [])

  const initializeGame = () => {
    // Select 6-8 vocabulary items for matching
    const selected = shuffleArray(VOCABULARY).slice(0, 6)

    // Create picture cards
    const pictures: PictureCard[] = selected.map((item, index) => ({
      id: `pic-${index}`,
      word: item.word,
      emoji: item.emoji,
      letter: item.letter,
      matched: false,
      flipped: false,
    }))

    // Create letter cards (duplicated and shuffled)
    const letters: LetterCard[] = selected.map((item, index) => ({
      id: `letter-${index}`,
      letter: item.letter,
      pairId: `pic-${index}`,
      matched: false,
    }))

    setPictureCards(shuffleArray(pictures))
    setLetterCards(shuffleArray(letters))
    setSelectedLetter(null)
    setMatchedCount(0)
    setFeedback('')
  }

  const handlePictureClick = async (pictureId: string) => {
    if (isLoading || selectedLetter === null) return

    const picture = pictureCards.find(p => p.id === pictureId)
    if (!picture || picture.matched) return

    const letter = letterCards.find(l => l.id === selectedLetter)
    if (!letter || letter.matched) return

    // Check if letters match
    if (picture.letter === letter.letter) {
      // Match found!
      playSound('correct')
      setFeedback(`✅ מעולה! התאמת ${picture.letter}`)
      store.incrementCorrect()
      store.incrementStreak()
      store.addScore(1)

      // Update cards
      setPictureCards(pictureCards.map(p =>
        p.id === pictureId ? { ...p, matched: true, flipped: true } : p
      ))
      setLetterCards(letterCards.map(l =>
        l.id === selectedLetter ? { ...l, matched: true } : l
      ))

      const newMatched = matchedCount + 1
      setMatchedCount(newMatched)

      // Check if game is complete
      if (newMatched === selected.length) {
        setTimeout(() => {
          setFeedback(`🎉 כל הכבוד! ביצעת מצוין!`)
          setTimeout(() => onGameEnd(store.score), 2000)
        }, 800)
      }

      setSelectedLetter(null)
    } else {
      // No match
      playSound('wrong')
      setFeedback(`❌ לא התאימו. נסו שוב!`)
      store.incrementIncorrect()
      store.resetStreak()
      setSelectedLetter(null)
    }
  }

  const handleLetterClick = (letterId: string) => {
    const letter = letterCards.find(l => l.id === letterId)
    if (!letter || letter.matched) return

    setSelectedLetter(selectedLetter === letterId ? null : letterId)
    setFeedback('')
  }

  const selected = shuffleArray(VOCABULARY).slice(0, 6)

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-pastel-light-purple via-white to-pastel-light-green p-4"
    >
      {/* Header */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-4">
          <button
            onClick={onBack}
            className="bg-pastel-red text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            ← חזור
          </button>
          <h2 className="text-2xl font-bold text-pastel-purple">התאם אותיות לתמונות</h2>
          <div className="text-2xl font-bold text-pastel-green">ניקוד: {store.score}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full max-w-5xl mb-6 bg-pastel-light-purple rounded-2xl p-4">
        <p className="text-lg font-bold text-gray-800 text-center">
          👈 בחרו אות מימין, ואז בחרו את התמונה המתאימה משמאל
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full h-full">
          {/* Left side - Picture Cards */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">תמונות</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
              {pictureCards.map((picture) => (
                <button
                  key={picture.id}
                  onClick={() => handlePictureClick(picture.id)}
                  disabled={picture.matched}
                  className={`game-option-button aspect-square text-5xl font-bold rounded-2xl transition-all transform
                    flex items-center justify-center
                    ${
                      picture.matched
                        ? 'bg-pastel-green text-white cursor-default scale-95'
                        : selectedLetter !== null
                          ? 'bg-white border-3 border-pastel-purple text-pastel-purple hover:scale-110 active:scale-95 cursor-pointer'
                          : 'bg-gradient-to-br from-pastel-light-blue to-pastel-light-green border-3 border-pastel-purple text-pastel-purple'
                    }
                    disabled:opacity-50`}
                >
                  {picture.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Letter Cards */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">אותיות</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
              {letterCards.map((letter) => (
                <button
                  key={letter.id}
                  onClick={() => handleLetterClick(letter.id)}
                  disabled={letter.matched}
                  className={`game-option-button aspect-square text-3xl font-bold rounded-2xl transition-all transform hover:scale-110 active:scale-95
                    flex items-center justify-center
                    ${
                      letter.matched
                        ? 'bg-pastel-green text-white cursor-default'
                        : selectedLetter === letter.id
                          ? 'bg-pastel-purple text-white shadow-lg scale-110'
                          : 'bg-white border-3 border-pastel-purple text-pastel-purple hover:bg-pastel-light-purple'
                    }
                    disabled:opacity-50`}
                >
                  {letter.letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="w-full max-w-5xl text-center mt-6 text-2xl font-bold h-12 flex items-center justify-center">
          {feedback}
        </div>
      )}

      {/* Stats */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-4 mt-6">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-gray-600 text-sm">התאמות</p>
            <p className="text-3xl font-bold text-pastel-green">{matchedCount}/{selected.length}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">נכונות</p>
            <p className="text-3xl font-bold text-pastel-blue">
              {store.correctAnswers + store.incorrectAnswers > 0
                ? Math.round((store.correctAnswers / (store.correctAnswers + store.incorrectAnswers)) * 100)
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">רצף</p>
            <p className="text-3xl font-bold text-pastel-orange">{store.consecutiveCorrect}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
