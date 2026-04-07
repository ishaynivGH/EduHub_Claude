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

    // Check if user already has a subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'User already has an active subscription or trial' },
        { status: 400 }
      )
    }

    // Create free trial subscription (30 days)
    const now = new Date()
    const trialEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          plan_type: 'free',
          billing_cycle: 'monthly',
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

    return NextResponse.json(
      { message: 'Free trial created successfully', subscription },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating trial:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
