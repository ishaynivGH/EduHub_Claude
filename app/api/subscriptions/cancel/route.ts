import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
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

    // Get current subscription to get Stripe ID
    const { data: currentSub, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError && subError.code !== 'PGRST116') {
      throw subError
    }

    // TODO: Integrate with Stripe here
    // 1. Get stripe_subscription_id from currentSub
    // 2. Call Stripe API to cancel subscription
    // Example code:
    // if (currentSub?.stripe_subscription_id) {
    //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    //   await stripe.subscriptions.del(currentSub.stripe_subscription_id)
    // }

    // Cancel the subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (error) throw error

    return NextResponse.json({ message: 'Subscription cancelled successfully' })
  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
