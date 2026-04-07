'use client'

import { useState, useEffect } from 'react'
import { SENTENCES, shuffleArray, extractWordsFromSentence } from '@/lib/games/gameData'
import { speakText, playSound, startListening } from '@/lib/games/gameUtils'
import { useGameStore } from '@/lib/games/gameStore'

interface GameProps {
  onGameEnd: (finalScore: number) => void
  onBack: () => void
}

type GamePhase = 'translation' | 'fill' | 'speak' | 'transition'

export default function SentencesGame({ onGameEnd, onBack }: GameProps) {
  const store = useGameStore()
  const [currentItem, setCurrentItem] = useState(SENTENCES[0])
  const [phase, setPhase] = useState<GamePhase>('translation')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [transMatches, setTransMatches] = useState(0)
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null)
  const [hebrewOptions, setHebrewOptions] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [speakRetries, setSpeakRetries] = useState(0)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)

  useEffect(() => {
    store.startGame('sentences')
    generateRound()
  }, [])

  const generateRound = async () => {
    setIsLoading(true)
    setFeedback('')
    setSelectedAnswer(null)
    setTransMatches(0)
    setPhase('translation')
    setSelectedEnglish(null)
    setMatchedPairs(new Set())

    const randomSentence = shuffleArray(SENTENCES)[0]
    setCurrentItem(randomSentence)

    // Prepare Hebrew translations shuffled
    const hebrewTranslations = Object.values(randomSentence.trans)
    setHebrewOptions(shuffleArray([...hebrewTranslations]))

    // Speak the sentence
    await speakText(randomSentence.text)
    setIsLoading(false)
  }

  const handleEnglishSelect = (enWord: string) => {
    // Don't allow selecting already matched pairs
    if (matchedPairs.has(enWord)) return
    setSelectedEnglish(enWord)
  }

  const handleHebrewSelect = (heWord: string) => {
    if (!selectedEnglish || isLoading) return

    // Check if the Hebrew word matches the English word translation
    const isCorrect = currentItem.trans[selectedEnglish] === heWord

    if (isCorrect) {
      playSound('correct')
      setFeedback('✅ תרגום נכון!')
      store.addScore(1)

      // Add this pair to matched pairs
      const newMatched = new Set(matchedPairs)
      newMatched.add(selectedEnglish)
      setMatchedPairs(newMatched)
      setSelectedEnglish(null)

      // Update counter and check if all translations are matched
      setTransMatches(prev => {
        const newCount = prev + 1
        const totalTranslations = Object.keys(currentItem.trans).length

        if (newCount >= totalTranslations) {
          // Move to fill phase after all translations are matched
          setTimeout(() => {
            setPhase('transition')
            setTimeout(() => setupFillPhase(), 800)
          }, 200)
        }
        return newCount
      })
    } else {
      playSound('wrong')
      setFeedback('❌ תרגום שגוי, נסו שוב')
      setSelectedEnglish(null)
    }
  }

  const setupFillPhase = async () => {
    setPhase('fill')
    setFeedback('')
    setSelectedAnswer(null)
  }

  const handleFillAnswer = (answer: string) => {
    if (isLoading) return

    const isCorrect = answer === currentItem.correct

    if (isCorrect) {
      playSound('correct')
      setFeedback(`✅ נכון! ${answer}`)
      store.addScore(1)
      setSelectedAnswer(answer)

      setTimeout(() => {
        setPhase('speak')
        setupSpeakPhase()
      }, 1500)
    } else {
      playSound('wrong')
      setFeedback(`❌ טעות. נסו שוב`)
      store.incrementIncorrect()
    }
  }

  const setupSpeakPhase = async () => {
    setSpeakRetries(0)
    setRecordingUrl(null)
    const filledSentence = currentItem.text.replace('___', currentItem.correct)
    await speakText(filledSentence)
  }

  const handleSpeakAnswer = async () => {
    const filledSentence = currentItem.text.replace('___', currentItem.correct)
    setFeedback('🎤 שמעתי אתכם, מחכה...')
    setIsLoading(true)

    await startListening(
      (transcript) => {
        // Check if user said the complete sentence
        // Extract key words from the sentence (filter out small words)
        const sentenceWords = filledSentence.toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 2)

        const transcriptWords = transcript.toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 2)

        // User should say at least 80% of the words
        const matchedWords = sentenceWords.filter(word =>
          transcriptWords.some(tWord => tWord.includes(word) || word.includes(tWord))
        )
        const matchPercentage = matchedWords.length / sentenceWords.length

        const isCorrect = matchPercentage >= 0.8

        if (isCorrect) {
          playSound('bonus')
          setFeedback('✅ מעולה! סיימתם את המשפט בהצלחה!')
          store.addScore(1)
          store.incrementStreak()
          store.incrementCorrect()
          setIsLoading(false)

          setTimeout(generateRound, 2500)
        } else {
          playSound('wrong')
          setSpeakRetries(prev => prev + 1)

          if (speakRetries >= 2) {
            // 3rd attempt failed - move on
            setFeedback(`❌ סיימנו את הניסיונות. המשפט הנכון הוא: "${filledSentence}"`)
            store.resetStreak()
            store.incrementIncorrect()
            setIsLoading(false)
            setTimeout(generateRound, 3000)
          } else {
            // Read back the sentence for next attempt
            setFeedback(`❌ נתנסו שוב. צריך להגיד את המשפט כולו`)
            setIsLoading(false)
            setTimeout(async () => {
              await speakText(filledSentence)
            }, 500)
          }
        }
      },
      (error) => {
        setSpeakRetries(prev => prev + 1)

        if (speakRetries >= 2) {
          const filledSentence = currentItem.text.replace('___', currentItem.correct)
          setFeedback(`❌ סיימנו את הניסיונות. המשפט הנכון הוא: "${filledSentence}"`)
          store.resetStreak()
          store.incrementIncorrect()
          setIsLoading(false)
          setTimeout(generateRound, 3000)
        } else {
          setFeedback(`❌ לא שמעתי בבירור. נתנסו שוב`)
          setIsLoading(false)
        }
      },
      8000  // 8 second timeout for speaking
    )
  }

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
          <h2 className="text-2xl font-bold text-pastel-blue">השלם משפט</h2>
          <div className="text-2xl font-bold text-pastel-green">ניקוד: {store.score}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center">
        {phase === 'translation' && (
          <>
            <div className="mb-6 text-center">
              <p className="text-lg font-bold text-pastel-blue mb-2">שלב 1: תרגום</p>
              <p className="text-gray-600">זווגו בין המילים לתרגומן</p>
            </div>

            <div className="bg-pastel-light-blue rounded-2xl p-6 w-full mb-6">
              <div className="text-center mb-6">
                <p dir="ltr" className="text-2xl font-bold text-gray-800">{currentItem.text}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* English Words Column */}
                <div>
                  <p className="text-sm font-bold text-pastel-blue mb-3 text-center">אנגלית</p>
                  <div className="space-y-2">
                    {Object.keys(currentItem.trans).map((en) => (
                      <button
                        key={en}
                        onClick={() => handleEnglishSelect(en)}
                        disabled={matchedPairs.has(en)}
                        className={`game-option-button w-full p-3 rounded-lg font-bold transition transform active:scale-95 ${
                          matchedPairs.has(en)
                            ? 'bg-pastel-blue text-white border-2 border-pastel-blue cursor-default opacity-70 shadow-md'
                            : selectedEnglish === en
                            ? 'bg-pastel-blue text-white border-2 border-pastel-blue'
                            : 'bg-white border-2 border-pastel-blue text-pastel-blue hover:bg-pastel-light-blue active:bg-pastel-blue active:text-white'
                        }`}
                      >
                        {en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hebrew Translations Column */}
                <div>
                  <p className="text-sm font-bold text-pastel-blue mb-3 text-center">עברית</p>
                  <div className="space-y-2">
                    {hebrewOptions.map((he) => {
                      // Check if this Hebrew translation is already matched
                      let isMatched = false
                      for (const matchedEn of matchedPairs) {
                        if (currentItem.trans[matchedEn] === he) {
                          isMatched = true
                          break
                        }
                      }

                      return (
                        <button
                          key={he}
                          onClick={() => handleHebrewSelect(he)}
                          disabled={!selectedEnglish || isMatched}
                          className={`game-option-button w-full p-3 rounded-lg font-bold transition transform active:scale-95 ${
                            isMatched
                              ? 'bg-pastel-blue text-white border-2 border-pastel-blue cursor-default opacity-70 shadow-md'
                              : selectedEnglish
                              ? 'bg-white border-2 border-pastel-blue text-pastel-blue hover:bg-pastel-light-blue cursor-pointer active:bg-pastel-blue active:text-white'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {he}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600 mt-4">
                {transMatches}/{Object.keys(currentItem.trans).length} תרגומים נכונים
              </p>
            </div>
          </>
        )}

        {phase === 'fill' && (
          <>
            <div className="mb-6 text-center">
              <p className="text-lg font-bold text-pastel-green mb-2">שלב 2: השלם משפט</p>
            </div>

            <div dir="ltr" className="text-3xl font-bold text-center mb-8 text-gray-800">
              {currentItem.text}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {[currentItem.correct, ...currentItem.wrongs].map((word) => (
                <button
                  key={word}
                  onClick={() => handleFillAnswer(word)}
                  className={`game-option-button py-3 px-4 font-bold rounded-lg transition transform active:scale-95 ${
                    selectedAnswer === word
                      ? 'bg-pastel-green text-white'
                      : 'bg-white border-2 border-pastel-green text-pastel-green hover:bg-pastel-light-green active:bg-pastel-green active:text-white'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'speak' && (
          <>
            <div className="mb-6 text-center">
              <p className="text-lg font-bold text-pastel-orange mb-2">שלב 3: דיבור</p>
              <p className="text-gray-600 mb-2">דברו את המשפט המלא בקול ברור</p>
              <p className="text-sm text-gray-500">ניסיון {speakRetries + 1} מתוך 3</p>
            </div>

            <div className="bg-pastel-light-orange rounded-2xl p-6 mb-8">
              <p dir="ltr" className="text-2xl font-bold text-center text-pastel-orange">
                {currentItem.text.replace('___', selectedAnswer || '...')}
              </p>
            </div>

            <button
              onClick={handleSpeakAnswer}
              disabled={isLoading}
              className="bg-pastel-orange text-white font-bold py-4 px-8 rounded-3xl text-2xl hover:opacity-90 disabled:opacity-50 transition"
            >
              🎤 דברו עכשיו
            </button>
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="text-2xl font-bold text-center mt-8">
            {feedback}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4 mt-6">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-gray-600 text-sm">נקודות</p>
            <p className="text-3xl font-bold text-pastel-green">{store.score}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">שלב</p>
            <p className="text-3xl font-bold text-pastel-blue">{phase === 'translation' ? '1' : phase === 'fill' ? '2' : '3'}</p>
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
