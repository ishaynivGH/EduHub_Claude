'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/login')
    }
  }, [session, loading, router])

  useEffect(() => {
    if (session?.user) {
      loadProfiles()
    }
  }, [session])

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session?.user.id)

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Error loading profiles:', err)
    } finally {
      setLoadingProfiles(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading || loadingProfiles) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-pastel-blue">LSIeduHub</h1>
          <button
            onClick={handleLogout}
            className="bg-pastel-red text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Welcome, {session?.user?.email}!
        </h2>

        {/* Profiles Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Your Student Profiles
          </h3>

          {profiles.length === 0 ? (
            <p className="text-gray-600 mb-6">
              You haven't created any profiles yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="border-2 border-pastel-blue rounded-2xl p-6 hover:shadow-lg transition"
                >
                  <h4 className="text-lg font-bold text-pastel-blue mb-2">
                    {profile.name}
                  </h4>
                  <p className="text-gray-600">Grade: {profile.grade_level}</p>
                  <p className="text-gray-600">Age: {profile.age}</p>
                  <button className="mt-4 w-full bg-pastel-green text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">
                    Select Profile
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="bg-pastel-blue text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition">
            + Add New Profile
          </button>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Next Steps
          </h3>
          <ul className="space-y-4 text-gray-600">
            <li>✅ Sign up successful!</li>
            <li>✅ Created user account</li>
            <li>✅ Set up student profile</li>
            <li>⏳ Subscribe to premium (coming soon)</li>
            <li>⏳ Start learning games (coming next week)</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
