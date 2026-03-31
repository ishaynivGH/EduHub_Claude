'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && session) {
      router.push('/dashboard')
    }
  }, [session, loading, router])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-2xl text-gray-600">Loading...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pastel-light-blue via-white to-pastel-light-green">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pastel-red via-pastel-blue to-pastel-green mb-4">
          Welcome to LSIeduHub
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          A comprehensive learning platform for students of all ages
        </p>
        <p className="text-gray-500 mb-8">
          Learn English, Math, Science, and more with interactive games and personalized progress tracking
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/signup">
            <button className="bg-gradient-to-r from-pastel-green to-pastel-blue hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all">
              Sign Up Free
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="bg-white border-2 border-pastel-blue hover:bg-blue-50 text-pastel-blue font-bold py-3 px-8 rounded-lg transition-all">
              Login
            </button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="font-bold text-lg mb-2">Interactive Games</h3>
            <p className="text-gray-600 text-sm">
              Learn through fun, engaging games designed for all ages
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-lg mb-2">Progress Tracking</h3>
            <p className="text-gray-600 text-sm">
              Monitor your learning journey with detailed analytics
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
            <h3 className="font-bold text-lg mb-2">Multi-Profile</h3>
            <p className="text-gray-600 text-sm">
              Multiple student profiles per account for families
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
