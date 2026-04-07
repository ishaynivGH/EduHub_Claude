'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import AudioRecorder from '@/lib/components/AudioRecorder'

type AdminTab = 'users' | 'plans' | 'games' | 'voices' | 'settings'

export default function AdminDashboard() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [savedVoices, setSavedVoices] = useState<Record<string, string>>({})
  const [selectedVoiceContext, setSelectedVoiceContext] = useState('letters')

  // Simple admin check - in production, verify via database
  const isAdmin = session?.user?.email === 'ishayniv@gmail.com' // Replace with your email

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

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold text-pastel-red mb-4">⛔ Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have admin access.</p>
          <Link href="/dashboard">
            <button className="bg-pastel-blue text-white font-bold py-3 px-6 rounded-lg hover:opacity-90">
              חזור לדשבורד
            </button>
          </Link>
        </div>
      </main>
    )
  }

  const handleVoiceSave = (blob: Blob, fileName: string) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const voiceId = `${selectedVoiceContext}/${fileName.toLowerCase()}`
      setSavedVoices((prev) => ({
        ...prev,
        [voiceId]: dataUrl,
      }))
      alert(`✅ Voice saved: ${voiceId}`)
    }
    reader.readAsDataURL(blob)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-pastel-blue">🔧 ניהול מערכת</h1>
            <Link href="/dashboard">
              <button className="bg-pastel-green text-white font-bold py-2 px-6 rounded-lg hover:opacity-90">
                ← חזור לדשבורד
              </button>
            </Link>
          </div>
          <p className="text-gray-600">ניהול משתמשים, תוכניות, משחקים וקול</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'users' as AdminTab, label: '👥 משתמשים', icon: '👥' },
            { id: 'plans' as AdminTab, label: '💳 תוכניות', icon: '💳' },
            { id: 'games' as AdminTab, label: '🎮 משחקים', icon: '🎮' },
            { id: 'voices' as AdminTab, label: '🎤 קולות', icon: '🎤' },
            { id: 'settings' as AdminTab, label: '⚙️ הגדרות', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-pastel-blue text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">👥 ניהול משתמשים</h2>
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  ✨ <strong>זה יהיה משולב עם Supabase בקרוב:</strong> צפיה בכל המשתמשים, שינוי תוכניות, צפיה בפעילות
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-pastel-light-blue rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-pastel-blue">--</p>
                    <p className="text-gray-600 text-sm mt-2">סה״כ משתמשים</p>
                  </div>
                  <div className="bg-pastel-light-green rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-pastel-green">--</p>
                    <p className="text-gray-600 text-sm mt-2">משתמשים פעילים</p>
                  </div>
                  <div className="bg-pastel-light-orange rounded-xl p-6 text-center">
                    <p className="text-4xl font-bold text-pastel-orange">--</p>
                    <p className="text-gray-600 text-sm mt-2">צפיות משחקים</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">💳 ניהול תוכניות</h2>
              <div className="space-y-6">
                <p className="text-gray-600">
                  ✨ <strong>תוכנית עתידית:</strong> יצירה/עריכה של תוכניות, הגדרת מחירים, הצעות מוגדלות אישיות
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Free', 'Pro', 'Premium'].map((plan) => (
                    <div
                      key={plan}
                      className="border-2 border-pastel-blue rounded-2xl p-6 hover:shadow-lg transition"
                    >
                      <h3 className="text-xl font-bold text-pastel-blue mb-4">{plan}</h3>
                      <button className="w-full bg-pastel-blue text-white font-bold py-2 rounded-lg hover:opacity-90">
                        ✏️ עריכה
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">🎮 ניהול משחקים</h2>
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  ✨ <strong>תוכנית עתידית:</strong> הפעלה/השבתה של משחקים, עריכת תוכן, קביעת קושי
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['letters', 'sounds', 'missing', 'elimination', 'sentences', 'speaking', 'memory'].map((game) => (
                    <div key={game} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <span className="font-semibold text-gray-800 capitalize">{game}</span>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span className="text-sm text-gray-600">מופעל</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Voices Tab */}
          {activeTab === 'voices' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">🎤 ניהול קולות</h2>

              <div className="space-y-6">
                {/* Voice Context Selection */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">בחרו קטגוריה</label>
                  <select
                    value={selectedVoiceContext}
                    onChange={(e) => setSelectedVoiceContext(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pastel-blue rounded-lg focus:outline-none focus:border-pastel-green"
                  >
                    <option value="letters">אותיות (a, b, c...)</option>
                    <option value="words">מילים (apple, ball...)</option>
                    <option value="feedback">משוב (כן/לא נכון)</option>
                    <option value="instructions">הנחיות (השמעו, דברו...)</option>
                  </select>
                </div>

                {/* Audio Recorder */}
                <AudioRecorder
                  label="הקליטו קול חדש"
                  onSave={handleVoiceSave}
                />

                {/* Saved Voices */}
                {Object.keys(savedVoices).length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">✅ קולות שנשמרו</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(savedVoices).map(([id, _]) => (
                        <div
                          key={id}
                          className="bg-pastel-light-green rounded-xl p-4 flex items-center justify-between"
                        >
                          <span className="font-semibold text-gray-800">{id}</span>
                          <button
                            onClick={() => {
                              const audio = new Audio(savedVoices[id])
                              audio.play()
                            }}
                            className="bg-pastel-blue text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm"
                          >
                            ▶️ השמע
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">⚙️ הגדרות מערכת</h2>
              <div className="space-y-6">
                <div className="bg-pastel-light-blue rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-pastel-blue mb-3">🔐 הרשאות מנהל</h3>
                  <p className="text-gray-600 mb-4">
                    כרגע, מנהלים מאומתים דרך כתובת אימייל. בעתיד, ניתן להוסיף מנהלים נוספים.
                  </p>
                  <button className="bg-pastel-blue text-white font-bold py-2 px-6 rounded-lg hover:opacity-90">
                    + הוסף מנהל
                  </button>
                </div>

                <div className="bg-pastel-light-green rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-pastel-green mb-3">📊 סטטיסטיקות</h3>
                  <p className="text-gray-600">
                    ✨ <strong>בקרוב:</strong> צפיה בנתונים כמו משחקים שהשחקו, משתמשים פעילים, הכנסות
                  </p>
                </div>

                <div className="bg-pastel-light-orange rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-pastel-orange mb-3">🔄 גיבויים</h3>
                  <p className="text-gray-600 mb-4">
                    ✨ <strong>בקרוב:</strong> הגדרות גיבוי ושחזור נתונים
                  </p>
                  <button className="bg-pastel-orange text-white font-bold py-2 px-6 rounded-lg hover:opacity-90">
                    ☁️ גיבוי עכשיו
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>🔒 עמוד זה מוגן ודורש הרשאות מנהל</p>
          <p className="mt-2">💡 תוכניות עתידיות: אינטגרציה מלאה עם Supabase לניהול משתמשים ותוכנים</p>
        </div>
      </div>
    </main>
  )
}
