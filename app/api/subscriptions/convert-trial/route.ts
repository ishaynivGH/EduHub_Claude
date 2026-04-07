import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { billingCycle } = await request.json()

    if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // TODO: When integrating Stripe:
    // 1. Get user's email and create/get Stripe customer
    // 2. Create Stripe subscription with appropriate price
    // 3. Get stripe_customer_id and stripe_subscription_id
    // 4. Handle payment processing

    const now = new Date()
    const periodEnd = billingCycle === 'monthly'
      ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    // Cancel any existing subscriptions
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])

    // Create member subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          plan_type: 'member',
          billing_cycle: billingCycle,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          // stripe_customer_id: stripeCustomerId,
          // stripe_subscription_id: stripeSubscriptionId,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { message: 'Successfully converted to member', subscription },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error converting to member:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
