import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
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

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Subscription check error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subscription) {
      // Return default free subscription
      return NextResponse.json({
        plan_type: 'free',
        status: 'active',
        message: 'No active subscription found, defaulting to free',
      })
    }

    return NextResponse.json(subscription)
  } catch (error: any) {
    console.error('Error checking subscription:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
