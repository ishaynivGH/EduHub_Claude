import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()

    if (!planType || !['free', 'premium', 'family'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
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

    // TODO: Integrate with Stripe here
    // 1. Call Stripe API to create customer or subscription
    // 2. Get stripe_customer_id and stripe_subscription_id
    // Example code:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const customer = await stripe.customers.create({ email: user.email })
    // const subscription = await stripe.subscriptions.create({
    //   customer: customer.id,
    //   items: [{ price: STRIPE_PRICE_IDS[planType] }],
    // })

    // For now, just create the subscription record in the database
    const now = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Cancel any existing active subscriptions first
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user.id)
      .eq('status', 'active')

    // Create new subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          plan_type: planType,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: nextMonth.toISOString(),
          // stripe_customer_id: customer.id,
          // stripe_subscription_id: subscription.id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { message: 'Subscription created successfully', subscription },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
