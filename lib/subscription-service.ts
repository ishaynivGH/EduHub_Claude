import { supabase } from './supabase'

export type SubscriptionPlan = 'free' | 'member'
export type BillingCycle = 'monthly' | 'annual'

export interface Subscription {
  id: string
  user_id: string
  plan_type: SubscriptionPlan
  billing_cycle: BillingCycle
  status: 'active' | 'trial' | 'cancelled' | 'expired'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  trial_started_at?: string
  trial_ends_at?: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface PricingBreakdown {
  profileCount: number
  pricing: {
    '1st': number
    '2nd': number
    'additional': number
  }
  monthlyTotal: number
  annualTotal: number
  annualSavings: number
}

// Pricing structure - Total cost per profile count
// 1 profile: $5
// 2 profiles: $5 + $4 = $9
// 3 profiles: $5 + $4 + $3 = $12
// 4 profiles: $5 + $4 + $3 + $3 = $15, etc
export const PROFILE_PRICING = {
  monthly: {
    '1st': 5.0,      // 1st profile: $5/month
    '2nd': 4.0,      // 2nd profile adds: $4/month
    'additional': 3.0 // Each additional adds: $3/month
  },
  annual: {
    '1st': 5.0 * 12 / 11,      // Pay for 11 months, get 12
    '2nd': 4.0 * 12 / 11,
    'additional': 3.0 * 12 / 11
  }
}

export const PRICING_PLANS = {
  free: {
    name: 'Free Trial',
    description: '30 days full access',
    duration_days: 30,
    features: [
      '30 days full access',
      'All content included',
      'All features available',
      'Unlimited profiles',
      'Full data access',
    ],
  },
  member: {
    name: 'Member',
    description: 'Pay per profile per month',
    features: [
      '1st profile: $5/month',
      '2nd profile: $9/month',
      'Additional profiles: $3/month',
      'All content included',
      'Unlimited profiles',
      'Full data access',
      'Annual discount: Pay 11, get 12 months',
    ],
  },
}

// Calculate monthly cost based on profile count
// 1 profile: $5
// 2 profiles: $5 + $4 = $9
// 3 profiles: $5 + $4 + $3 = $12
// 4 profiles: $5 + $4 + $3 + $3 = $15, etc
export const calculateMonthlyCost = (profileCount: number, billing: BillingCycle = 'monthly'): number => {
  if (profileCount === 0) return 0

  const rates = PROFILE_PRICING[billing]
  let total = 0

  if (profileCount >= 1) total += rates['1st']      // First profile: $5
  if (profileCount >= 2) total += rates['2nd']      // Second profile: +$4
  if (profileCount > 2) total += (profileCount - 2) * rates['additional'] // Additional: +$3 each

  return Math.round(total * 100) / 100
}

// Calculate annual cost
export const calculateAnnualCost = (profileCount: number): number => {
  const monthlyCost = calculateMonthlyCost(profileCount, 'annual')
  return Math.round(monthlyCost * 12 * 100) / 100
}

// Get pricing breakdown for display
export const getPricingBreakdown = (profileCount: number): PricingBreakdown => {
  const monthlyTotal = calculateMonthlyCost(profileCount, 'monthly')
  const annualTotal = calculateAnnualCost(profileCount)
  const annualMonthlyRate = calculateMonthlyCost(profileCount, 'annual')

  return {
    profileCount,
    pricing: PROFILE_PRICING.monthly,
    monthlyTotal,
    annualTotal,
    annualSavings: Math.round((monthlyTotal * 12 - annualTotal) * 100) / 100,
  }
}

// Get user's current subscription
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code === 'PGRST116') {
      // No rows returned
      return null
    }

    if (error) throw error
    return data as Subscription
  } catch (err) {
    console.error('Error fetching subscription:', err)
    return null
  }
}

// Check if user has active subscription
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId)
  return subscription?.status === 'active' || subscription?.status === 'trial' || false
}

// Check if user is in free trial
export const isInFreeTrial = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId)
  return subscription?.status === 'trial' || false
}

// Create free trial subscription (30 days)
export const createFreeTrial = async (userId: string): Promise<{ success: boolean; subscription?: Subscription; error?: string }> => {
  try {
    const now = new Date()
    const trialEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: 'free',
          billing_cycle: 'monthly', // Dummy value, not used for free trial
          status: 'trial',
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEnds.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: trialEnds.toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    return { success: true, subscription: data as Subscription }
  } catch (err: any) {
    console.error('Error creating free trial:', err)
    return { success: false, error: err.message }
  }
}

// Convert free trial to member subscription
export const convertTrialToMember = async (
  userId: string,
  billingCycle: BillingCycle = 'monthly',
): Promise<{ success: boolean; subscription?: Subscription; error?: string }> => {
  try {
    // TODO: When integrating Stripe:
    // 1. Call Stripe API to create subscription
    // 2. Get stripe_customer_id and stripe_subscription_id

    const now = new Date()
    const periodEnd = billingCycle === 'monthly'
      ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    // Cancel any existing subscriptions
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])

    // Create member subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_type: 'member',
          billing_cycle: billingCycle,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    return { success: true, subscription: data as Subscription }
  } catch (err: any) {
    console.error('Error converting trial to member:', err)
    return { success: false, error: err.message }
  }
}

// Cancel subscription
export const cancelSubscription = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // TODO: When integrating Stripe, call Stripe API to cancel

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])

    if (error) throw error

    return { success: true }
  } catch (err: any) {
    console.error('Error cancelling subscription:', err)
    return { success: false, error: err.message }
  }
}

// Get member cost for a specific user based on their profile count
export const getMemberCost = async (userId: string): Promise<{ monthly: number; annual: number } | null> => {
  try {
    // Get user's subscription
    const subscription = await getUserSubscription(userId)
    if (!subscription || subscription.plan_type !== 'member') {
      return null
    }

    // Count user's profiles
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error

    const profileCount = count || 0
    const monthly = calculateMonthlyCost(profileCount, 'monthly')
    const annual = calculateAnnualCost(profileCount)

    return { monthly, annual }
  } catch (err) {
    console.error('Error getting member cost:', err)
    return null
  }
}

// Check if user can add more profiles based on their plan
export const canUserAddProfile = async (userId: string): Promise<{ canAdd: boolean; reason?: string; currentProfiles: number; maxProfiles: number | null }> => {
  try {
    // Get user's subscription
    const subscription = await getUserSubscription(userId)

    // Count user's profiles
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error

    const currentProfiles = count || 0

    // During free trial: unlimited profiles
    if (subscription?.status === 'trial') {
      return { canAdd: true, currentProfiles, maxProfiles: null }
    }

    // After trial (Member): limit = number of paid profiles
    // The max profiles allowed = the number they're currently paying for
    const maxProfiles = currentProfiles

    return {
      canAdd: currentProfiles < maxProfiles,
      reason: currentProfiles >= maxProfiles
        ? `You have reached the profile limit (${maxProfiles}) for your plan. Upgrade to add more.`
        : undefined,
      currentProfiles,
      maxProfiles,
    }
  } catch (err) {
    console.error('Error checking profile limit:', err)
    return { canAdd: true, currentProfiles: 0, maxProfiles: null }
  }
}
