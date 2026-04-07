'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { calculateMonthlyCost, calculateAnnualCost, PROFILE_PRICING } from '@/lib/subscription-service'
import { supabase } from '@/lib/supabase'

type BillingCycle = 'monthly' | 'annual'

export default function Pricing() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [profileCount, setProfileCount] = useState(1)
  const [subscribing, setSubscribing] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadCurrentPlan()
    }
  }, [session])

  const loadCurrentPlan = async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('plan_type, billing_cycle')
        .eq('user_id', session?.user.id)
        .in('status', ['active', 'trial'])
        .limit(1)
        .maybeSingle()

      if (data) {
        setCurrentPlan(data.plan_type)
        if (data.plan_type === 'member') {
          setBillingCycle(data.billing_cycle || 'monthly')
        }
      }
    } catch (err) {
      console.error('Error loading current plan:', err)
    }
  }

  const monthlyCost = calculateMonthlyCost(profileCount, 'monthly')
  const annualCost = calculateAnnualCost(profileCount)
  const monthlyWithAnnual = calculateMonthlyCost(profileCount, 'annual')
  const annualSavings = Math.round((monthlyCost * 12 - annualCost) * 100) / 100

  const handleStartTrial = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    setSubscribing(true)
    try {
      // Create free trial
      const response = await fetch('/api/subscriptions/create-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to start trial')
      }

      setCurrentPlan('free')
      alert('Welcome! Your 30-day free trial is now active.')
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('Trial error:', error)
      alert('Error starting trial. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  const handleSubscribeAsMember = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    setSubscribing(true)
    try {
      // TODO: When integrating Stripe, this should show checkout
      // For now, just create the member subscription
      const response = await fetch('/api/subscriptions/convert-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ billingCycle }),
      })

      if (!response.ok) {
        throw new Error('Failed to upgrade')
      }

      setCurrentPlan('member')
      alert(`Welcome to Member plan! Your subscription is now active.`)
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('Subscription error:', error)
      alert('Error creating subscription. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
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
          {session && (
            <Link href="/dashboard">
              <button className="text-pastel-blue font-semibold hover:underline">
                Back to Dashboard
              </button>
            </Link>
          )}
        </div>
      </header>

      {/* Pricing Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Start with 30 days free. Become a member and pay only for the profiles you create.
          </p>
        </div>

        {/* Free Trial & Member Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Trial Card */}
          <div className="rounded-3xl shadow-lg p-8 bg-white">
            <div className="mb-4">
              <span className="bg-pastel-green text-white px-4 py-1 rounded-full text-sm font-bold">
                Best to Start
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">Free Trial</h3>
            <p className="text-gray-600 mb-6">30 days of full access</p>

            <div className="mb-6 p-4 bg-pastel-light-green rounded-lg">
              <p className="text-gray-700 font-semibold mb-2">Includes:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ All content access</li>
                <li>✓ Unlimited profiles</li>
                <li>✓ All features</li>
                <li>✓ No payment required</li>
              </ul>
            </div>

            <button
              onClick={handleStartTrial}
              disabled={subscribing || currentPlan === 'free'}
              className="w-full font-bold py-3 px-4 rounded-lg transition bg-pastel-green text-white hover:opacity-90 disabled:opacity-50"
            >
              {currentPlan === 'free' ? '✓ Already Active' : subscribing ? 'Starting...' : 'Start Free Trial'}
            </button>
          </div>

          {/* Member Card */}
          <div className="rounded-3xl shadow-lg p-8 bg-gradient-to-br from-pastel-blue to-pastel-green text-white ring-2 ring-pastel-blue">
            <div className="mb-4">
              <span className="bg-white text-pastel-blue px-4 py-1 rounded-full text-sm font-bold">
                Recommended
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-2">Member Plan</h3>
            <p className="text-blue-100 mb-6">Simple per-profile pricing</p>

            <div className="mb-6">
              {/* Billing Toggle */}
              <div className="flex gap-2 mb-4 bg-white bg-opacity-20 p-1 rounded-lg">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-2 rounded font-bold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-pastel-blue'
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`flex-1 py-2 rounded font-bold transition ${
                    billingCycle === 'annual'
                      ? 'bg-white text-pastel-blue'
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Annual
                </button>
              </div>

              {/* Profile Count Selector */}
              <label className="block text-sm mb-2 font-semibold">
                Number of Profiles: {profileCount}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={profileCount}
                onChange={(e) => setProfileCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Important Note */}
            <div className="mb-6 p-3 bg-white bg-opacity-20 rounded-lg">
              <p className="text-xs opacity-90 font-semibold">
                💡 You'll be able to create {profileCount} profile{profileCount !== 1 ? 's' : ''} with this plan.
              </p>
            </div>

            {/* Pricing Breakdown */}
            <div className="mb-6 p-4 bg-white bg-opacity-10 rounded-lg">
              <p className="text-xs opacity-90 font-semibold mb-3">Price Breakdown:</p>
              <div className="space-y-2 text-sm mb-4">
                {profileCount >= 1 && (
                  <div className="flex justify-between">
                    <span>1st Profile:</span>
                    <span>${billingCycle === 'monthly' ? PROFILE_PRICING.monthly['1st'].toFixed(2) : PROFILE_PRICING.annual['1st'].toFixed(2)}</span>
                  </div>
                )}
                {profileCount >= 2 && (
                  <div className="flex justify-between">
                    <span>2nd Profile (adds):</span>
                    <span>+${billingCycle === 'monthly' ? PROFILE_PRICING.monthly['2nd'].toFixed(2) : PROFILE_PRICING.annual['2nd'].toFixed(2)}</span>
                  </div>
                )}
                {profileCount > 2 && (
                  <div className="flex justify-between">
                    <span>{profileCount - 2} Additional Profile(s) (adds):</span>
                    <span>+${((profileCount - 2) * (billingCycle === 'monthly' ? PROFILE_PRICING.monthly['additional'] : PROFILE_PRICING.annual['additional'])).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white border-opacity-30 pt-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-90">
                      {billingCycle === 'monthly' ? 'Per Month' : 'Per Month (Annual Rate)'}
                    </p>
                    <p className="text-3xl font-bold">
                      ${billingCycle === 'monthly' ? monthlyCost.toFixed(2) : monthlyWithAnnual.toFixed(2)}
                    </p>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-right">
                      <p className="text-xs opacity-90">Paid Annually</p>
                      <p className="text-2xl font-bold">${annualCost.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {billingCycle === 'annual' && annualSavings > 0 && (
                  <p className="text-sm mt-2 font-semibold opacity-90">
                    💰 Save ${annualSavings.toFixed(2)}/year (pay 11, get 12!)
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubscribeAsMember}
              disabled={subscribing || currentPlan === 'member'}
              className="w-full font-bold py-3 px-4 rounded-lg transition bg-white text-pastel-blue hover:opacity-90 disabled:opacity-50"
            >
              {currentPlan === 'member' ? '✓ Already Member' : subscribing ? 'Processing...' : 'Become Member'}
            </button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">What's Included</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-4">Free Trial & Members Get</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-green">✓</span>
                  <span>All content access (all subjects)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-green">✓</span>
                  <span>Unlimited student profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-green">✓</span>
                  <span>Full learning analytics & progress tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-green">✓</span>
                  <span>All interactive games & features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-green">✓</span>
                  <span>Access for all profiles simultaneously</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-4">Pricing Model</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-blue">📋</span>
                  <span><strong>Pay per profile:</strong> 1st $5, 2nd $9, rest $3 each</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-blue">📅</span>
                  <span><strong>Monthly or Annual:</strong> Same pricing, annual saves 1 month</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-blue">🎁</span>
                  <span><strong>Annual bonus:</strong> Pay for 11 months, get 12</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-blue">➕</span>
                  <span><strong>Add profiles anytime:</strong> Cost adjusts automatically</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3 text-pastel-blue">❌</span>
                  <span><strong>No hidden fees:</strong> Pay only for profiles you create</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">How does the pricing work?</h4>
              <p className="text-gray-600">
                You pay per student profile you create. The cost increases as you add more profiles: 1st is $5, 2nd is $9, and any additional profiles are $3 each per month.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Can I start with the free trial?</h4>
              <p className="text-gray-600">
                Yes! Everyone starts with 30 days of free access to all features. No payment required. After 30 days, you can choose to become a member.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">What happens after my free trial ends?</h4>
              <p className="text-gray-600">
                When your 30-day trial ends, your account pauses. You can choose to become a member to continue. All your progress and profiles are saved.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Can I add profiles after subscribing?</h4>
              <p className="text-gray-600">
                Yes! During your 30-day free trial, you can create unlimited profiles. Once you become a member, the number of profiles you can create matches the number you're paying for. For example, if you're on a 2-profile plan, you can have up to 2 profiles. Want to add a 3rd? Your plan upgrades to 3 profiles ($17/month).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">What's the annual discount?</h4>
              <p className="text-gray-600">
                With annual billing, you pay for 11 months and get 12. That's effectively one free month! The per-profile pricing stays the same.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-2">Can I downgrade to fewer profiles?</h4>
              <p className="text-gray-600">
                Yes, you can manage your profiles anytime. Your cost adjusts based on active profiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
