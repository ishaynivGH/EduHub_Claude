'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { calculateMonthlyCost, calculateAnnualCost } from '@/lib/subscription-service'
import GameStats from './components/GameStats'
import GameHistory from './components/GameHistory'

interface Subscription {
  plan_type: 'free' | 'member'
  status: string
  billing_cycle?: 'monthly' | 'annual'
  trial_ends_at?: string
}

export default function Dashboard() {
  const router = useRouter()
  const { session, loading } = useAuth()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [showAddProfile, setShowAddProfile] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileAge, setNewProfileAge] = useState('')
  const [newProfileGrade, setNewProfileGrade] = useState('K')
  const [addingProfile, setAddingProfile] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/login')
    }
  }, [session, loading, router])

  useEffect(() => {
    if (session?.user) {
      loadProfiles()
      loadSubscription()
    }
  }, [session])

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type, status, billing_cycle, trial_ends_at')
        .eq('user_id', session?.user.id)
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      // Default to free trial if no active subscription
      setSubscription(data || { plan_type: 'free', status: 'trial' })
    } catch (err) {
      console.error('Error loading subscription:', err)
      setSubscription({ plan_type: 'free', status: 'trial' })
    } finally {
      setLoadingSubscription(false)
    }
  }

  const getTrialDaysRemaining = (): number | null => {
    if (!subscription?.trial_ends_at) return null
    const now = new Date()
    const trialEnd = new Date(subscription.trial_ends_at)
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysRemaining > 0 ? daysRemaining : 0
  }

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

  const getMaxProfiles = (): number | null => {
    // During free trial: unlimited
    if (subscription?.status === 'trial') {
      return null // null means unlimited
    }

    // After trial (Member): limit = number of paid profiles
    // 1 profile plan = max 1, 2 profiles plan = max 2, etc.
    // Calculate based on profile count pricing
    // This is a bit tricky - we need to know how many they're paying for
    // For now, we'll use: profiles.length represents their current subscription level
    // So max = profiles.length (they're paying for what they have)
    return profiles.length
  }

  const canAddProfile = (): boolean => {
    const max = getMaxProfiles()
    if (max === null) return true // unlimited during trial
    return profiles.length < max
  }

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingProfile(true)

    try {
      // Check if they can add more profiles
      if (!canAddProfile()) {
        const max = getMaxProfiles()
        alert(`You have reached the profile limit (${max}) for your plan. Upgrade your membership to add more profiles.`)
        setAddingProfile(false)
        return
      }

      const { error } = await supabase.from('profiles').insert([
        {
          user_id: session?.user.id,
          name: newProfileName,
          age: parseInt(newProfileAge),
          grade_level: newProfileGrade,
        },
      ])

      if (error) throw error

      // Refresh profiles
      await loadProfiles()

      // Reset form
      setNewProfileName('')
      setNewProfileAge('')
      setNewProfileGrade('K')
      setShowAddProfile(false)
    } catch (err) {
      console.error('Error adding profile:', err)
      alert('Error adding profile. Please try again.')
    } finally {
      setAddingProfile(false)
    }
  }

  if (loading || loadingProfiles || loadingSubscription) {
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
          <div className="flex items-center gap-4">
            {/* Subscription Badge */}
            {!loadingSubscription && subscription && (
              <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                subscription.status === 'trial'
                  ? 'bg-pastel-green text-white'
                  : subscription.plan_type === 'member'
                    ? 'bg-pastel-blue text-white'
                    : 'bg-gray-100 text-gray-700'
              }`}>
                {subscription.status === 'trial' ? (
                  <span>Free Trial ({getTrialDaysRemaining()} days left)</span>
                ) : subscription.plan_type === 'member' ? (
                  <span>Member - {subscription.billing_cycle === 'annual' ? 'Annual' : 'Monthly'}</span>
                ) : (
                  'Free'
                )}
              </div>
            )}
            {(subscription?.status === 'trial' || subscription?.plan_type === 'member') && (
              <Link href="/pricing">
                <button className="bg-gradient-to-r from-pastel-blue to-pastel-green text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition text-sm">
                  Manage Plan
                </button>
              </Link>
            )}
            {session?.user?.email === 'ishayniv@gmail.com' && (
              <Link href="/admin">
                <button className="bg-purple-500 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition">
                  🔧 ניהול מערכת
                </button>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-pastel-red text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Welcome, {session?.user?.email}!
        </h2>

        {/* Profiles Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              Your Student Profiles
            </h3>
            {subscription?.status === 'trial' ? (
              <span className="text-sm text-gray-600">
                Unlimited during trial
              </span>
            ) : (
              <span className="text-sm font-semibold text-pastel-blue">
                {profiles.length} of {profiles.length} profiles
              </span>
            )}
          </div>

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
                  <p className="text-sm text-gray-500 mt-2">Games Played: {profile.games_played || 0}</p>
                  <Link href={`/games?profileId=${profile.id}`}>
                    <button className="mt-4 w-full bg-pastel-green text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition">
                      Play Games ➔
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!showAddProfile ? (
            <div>
              <button
                onClick={() => setShowAddProfile(true)}
                disabled={!canAddProfile()}
                className={`font-bold py-3 px-6 rounded-lg transition ${
                  canAddProfile()
                    ? 'bg-pastel-blue text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                + Add New Profile
              </button>
              {!canAddProfile() && subscription?.status !== 'trial' && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-2">
                    You've reached the profile limit for your plan.
                  </p>
                  <Link href="/pricing">
                    <button className="text-sm bg-pastel-blue text-white px-4 py-2 rounded hover:opacity-90 transition">
                      Upgrade Your Plan
                    </button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddProfile} className="bg-pastel-light-blue rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-lg text-pastel-blue">Add New Profile</h4>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g., Emma"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pastel-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={newProfileAge}
                  onChange={(e) => setNewProfileAge(e.target.value)}
                  placeholder="e.g., 8"
                  min="3"
                  max="18"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pastel-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Grade Level
                </label>
                <select
                  value={newProfileGrade}
                  onChange={(e) => setNewProfileGrade(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pastel-blue"
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

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addingProfile}
                  className="flex-1 bg-pastel-green text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {addingProfile ? 'Adding...' : 'Add Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProfile(false)}
                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:opacity-90 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className={`rounded-3xl shadow-lg p-8 mb-8 ${
            subscription.status === 'trial'
              ? 'bg-gradient-to-r from-pastel-light-green via-white to-pastel-light-blue'
              : 'bg-gradient-to-r from-pastel-light-blue via-white to-pastel-light-green'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {subscription.status === 'trial' ? 'Free Trial' : 'Member Account'}
                </h3>
                {subscription.status === 'trial' ? (
                  <div>
                    <p className="text-gray-600 mb-2">
                      🎉 You have <span className="font-bold text-pastel-green">{getTrialDaysRemaining()} days</span> remaining in your free trial.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Enjoy unlimited access to all content and features. No payment needed yet!
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      You have <span className="font-bold">{profiles.length}</span> student profile{profiles.length !== 1 ? 's' : ''}.
                    </p>
                    <div className="text-sm text-gray-600 mt-3 space-y-1">
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span className="font-bold">${calculateMonthlyCost(profiles.length, 'monthly').toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Cost:</span>
                        <span className="font-bold">${calculateAnnualCost(profiles.length).toFixed(2)}</span>
                      </div>
                      {subscription.billing_cycle === 'annual' && (
                        <div className="text-pastel-green text-xs mt-1">
                          💰 You save ${(calculateMonthlyCost(profiles.length, 'monthly') * 12 - calculateAnnualCost(profiles.length)).toFixed(2)}/year
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className={`text-2xl font-bold px-4 py-3 rounded-lg text-center ${
                  subscription.status === 'trial'
                    ? 'bg-white text-pastel-green'
                    : 'bg-white text-pastel-blue'
                }`}>
                  {subscription.status === 'trial' ? '30 Days' : `$${calculateMonthlyCost(profiles.length, 'monthly').toFixed(2)}`}
                  {subscription.status !== 'trial' && (
                    <p className="text-xs font-normal text-gray-600 mt-1">/month</p>
                  )}
                </div>
              </div>
            </div>
            {subscription.status === 'trial' && (
              <Link href="/pricing">
                <button className="bg-gradient-to-r from-pastel-blue to-pastel-green text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition">
                  Become a Member
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Quick Start */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Next Steps
          </h3>
          <ul className="space-y-4 text-gray-600">
            <li>✅ Sign up successful!</li>
            <li>✅ Created user account</li>
            <li>✅ Set up student profile</li>
            <li>{subscription?.plan_type === 'free' ? '⏳' : '✅'} {subscription?.plan_type === 'free' ? 'Subscribe to premium' : 'Premium subscription active'}</li>
            <li>✅ Start learning games!</li>
          </ul>
        </div>

        {/* Game Statistics Section */}
        {profiles.length > 0 && (
          <>
            <GameStats profileId={profiles[0].id} />
            <div className="mt-8" />
            <GameHistory profileId={profiles[0].id} />
            <div className="mt-8" />
          </>
        )}

        {/* Start Games Button */}
        <Link href={profiles.length > 0 ? `/games?profileId=${profiles[0].id}` : '/games'}>
          <button className="w-full bg-gradient-to-r from-pastel-blue to-pastel-green text-white font-bold py-4 px-8 rounded-3xl text-2xl hover:opacity-90 transition shadow-lg">
            🎮 התחילו לשחק עכשיו!
          </button>
        </Link>
      </div>
    </main>
  )
}
