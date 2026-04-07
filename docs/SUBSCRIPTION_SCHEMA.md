# Subscription Schema Update

This document outlines the SQL schema needed for the subscription system.

## Current Status

The subscriptions table should already exist from the initial setup. However, you may need to add a few fields for Stripe integration.

## SQL Migration

If the subscriptions table is missing or incomplete, run this SQL in your Supabase SQL Editor:

```sql
-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium', 'family')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),

  -- Stripe integration fields (optional, for when you integrate Stripe)
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- Billing period tracking
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Indexes for performance
  UNIQUE(user_id, status) -- Only one active subscription per user
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own subscriptions
CREATE POLICY "Users can see their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
```

## Testing the Subscription System

### 1. Sign up for a new account
```
Go to http://localhost:3000/auth/signup
Sign up with email/password
Create a student profile
```

### 2. View your subscription status
```
Go to http://localhost:3000/dashboard
You should see "Free" badge in the header
Click "Upgrade" button to go to pricing page
```

### 3. "Subscribe" to a plan (mock)
```
On http://localhost:3000/pricing
Click "Choose Plan" for any plan
This creates a mock subscription in Supabase
You'll see the subscription status update on dashboard
```

### 4. Check subscription in database
```
Go to Supabase Dashboard
Navigate to: Database → subscriptions table
You should see your new subscription record
plan_type: 'free', 'premium', or 'family'
status: 'active'
```

## Stripe Integration (Future)

When you're ready to integrate Stripe, you'll need to:

1. Create Stripe API keys in `.env.local`:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

2. Update the API routes:
- `/app/api/subscriptions/create/route.ts` - Call Stripe API to create subscription
- `/app/api/subscriptions/cancel/route.ts` - Call Stripe API to cancel subscription
- Add webhook handler for subscription updates

3. Install Stripe SDK:
```bash
npm install stripe @stripe/react-stripe-js @stripe/js
```

4. The database fields `stripe_customer_id` and `stripe_subscription_id` will then be populated.

## Plan Features Reference

### Free Plan
- 5 games per day limit
- 1 student profile
- Basic progress tracking
- Limited content access
- Price: $0

### Premium Plan
- Unlimited games
- 1 student profile
- Full progress analytics
- Access to all subjects
- Ad-free experience
- Priority support
- Price: $4.99/month

### Family Plan
- Unlimited games for all
- Up to 5 student profiles
- Full progress analytics per student
- Access to all subjects
- Ad-free experience
- Priority support
- Parent dashboard
- Price: $9.99/month

## Implementation Notes

- The mock subscription system allows testing without Stripe
- When you click "Choose Plan", it creates a database record
- The subscription status appears immediately on the dashboard
- Games/features will be restricted based on plan_type in future phases
- All timestamps are automatically set by the database
