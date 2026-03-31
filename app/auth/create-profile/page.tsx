'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function CreateProfile() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gradeLevel, setGradeLevel] = useState('K')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    router.push('/auth/signup')
    return null
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.from('profiles').insert([
        {
          user_id: user.id,
          name,
          age: parseInt(age),
          grade_level: gradeLevel,
        },
      ])

      if (error) throw error

      // Create default free subscription
      await supabase.from('subscriptions').insert([
        {
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
        },
      ])

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-light-green via-white to-pastel-light-blue p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-pastel-green">
          Create Profile
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Let's set up your first student profile
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emma"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pastel-green transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 8"
              min="3"
              max="18"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pastel-green transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pastel-green transition"
              required
            >
              <option value="K">Kindergarten</option>
              <option value="1">1st Grade</option>
              <option value="2">2nd Grade</option>
              <option value="3">3rd Grade</option>
              <option value="4">4th Grade</option>
              <option value="5">5th Grade</option>
              <option value="6">6th Grade</option>
              <option value="7">7th Grade</option>
              <option value="8">8th Grade</option>
              <option value="9">9th Grade</option>
              <option value="10">10th Grade</option>
              <option value="11">11th Grade</option>
              <option value="12">12th Grade</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pastel-green to-pastel-blue text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating profile...' : 'Continue'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          You can create more profiles later for siblings or different grade levels
        </p>
      </div>
    </main>
  )
}
