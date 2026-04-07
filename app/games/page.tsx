'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GAMES } from '@/lib/games/gameData'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  name: string
}

export default function GamesPage() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedProfileId = searchParams.get('profileId')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentProfileId, setCurrentProfileId] = useState<string>('')
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  // Load user's profiles
  useEffect(() => {
    if (!session) return

    const loadProfiles = async () => {
      try {
        setLoadingProfiles(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('user_id', session.user.id)

        if (error) throw error

        setProfiles(data || [])

        // Set initial profile
        if (selectedProfileId) {
          setCurrentProfileId(selectedProfileId)
        } else if (data && data.length > 0) {
          setCurrentProfileId(data[0].id)
        }
      } catch (error) {
        console.error('Failed to load profiles:', error)
      } finally {
        setLoadingProfiles(false)
      }
    }

    loadProfiles()
  }, [session, selectedProfileId])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading...</p>
      </main>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green"
    >
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-pastel-blue">LSIeduHub</h1>
          <Link href="/dashboard">
            <button className="text-pastel-blue font-semibold hover:underline">
              ← חזור לדשבורד
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Profile Selector */}
        {loadingProfiles ? (
          <div className="text-center mb-8">
            <p className="text-gray-600">Loading profiles...</p>
          </div>
        ) : profiles.length > 0 ? (
          <div className="mb-12 bg-gradient-to-r from-pastel-light-blue to-pastel-light-green rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-bold text-pastel-blue mb-2">
              1️⃣ בחרו פרופיל:
            </label>
            <p className="text-sm text-gray-600 mb-4">בחרו מי משחק ואז בחרו משחק מהרשימה למטה</p>
            <div className="flex gap-3 flex-wrap">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    console.log('Selected profile:', profile.id)
                    setCurrentProfileId(profile.id)
                  }}
                  className={`px-6 py-3 rounded-lg font-bold transition ${
                    currentProfileId === profile.id
                      ? 'bg-pastel-blue text-white shadow-lg scale-105'
                      : 'bg-white text-gray-800 border-2 border-pastel-blue hover:bg-pastel-light-blue'
                  }`}
                >
                  {profile.name} {currentProfileId === profile.id && '✓'}
                </button>
              ))}
            </div>
            {currentProfileId && (
              <p className="text-sm text-pastel-green font-bold mt-4">
                ✅ {profiles.find(p => p.id === currentProfileId)?.name} בחור/בחורה! בחרו משחק להלן 👇
              </p>
            )}
          </div>
        ) : null}

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            בחרו משחק ללמידה
          </h2>
          <p className="text-xl text-gray-600">
            בחרו את המשחק שאתם רוצים לשחק ולתרגל אנגלית
          </p>
        </div>

        {/* Basic Games */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">🎮 משחקי בסיס</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.slice(0, 4).map((game) => (
              <Link
                key={game.id}
                href={currentProfileId ? `/games/${game.id}?profileId=${currentProfileId}` : '#'}
                onClick={(e) => !currentProfileId && e.preventDefault()}
              >
                <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer h-full">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {game.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {game.description}
                  </p>
                  <div className="text-pastel-blue font-bold">
                    משחק בסיס ➔
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Advanced Games */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">🔥 משחקים מתקדמים</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.slice(4).map((game) => (
              <Link
                key={game.id}
                href={currentProfileId ? `/games/${game.id}?profileId=${currentProfileId}` : '#'}
                onClick={(e) => !currentProfileId && e.preventDefault()}
              >
                <div className="bg-gradient-to-br from-pastel-light-orange to-pastel-light-green rounded-3xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 cursor-pointer h-full border-2 border-pastel-orange">
                  <h3 className="text-2xl font-bold text-pastel-orange mb-3">
                    {game.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {game.description}
                  </p>
                  <div className="text-pastel-orange font-bold">
                    משחק מתקדם ➔
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-white rounded-3xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">💡 טיפים</h3>
          <ul className="space-y-3 text-gray-600">
            <li>✓ התחילו במשחקי בסיס אם אתם חדשים</li>
            <li>✓ כל תשובה נכונה = נקודה אחת</li>
            <li>✓ 5 תשובות נכונות ברציפות = שאלת בונוס!</li>
            <li>✓ היצמדו למשחק וראו את ההתקדמות שלכם</li>
            <li>✓ נסו את משחקי היום כדי לתרגל אמנויות שונות</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
