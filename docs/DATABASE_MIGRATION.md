# Database Migration - New Subscription Model

## ⚠️ Important: Update Supabase Schema

Run this SQL in your Supabase SQL Editor before testing the new pricing model.

## SQL Commands

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Step 1: Add missing columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Update existing records to avoid null values
UPDATE public.subscriptions
SET billing_cycle = 'monthly'
WHERE billing_cycle IS NULL AND plan_type != 'free';

UPDATE public.subscriptions
SET status = 'trial'
WHERE plan_type = 'free' AND status = 'active';

-- Step 3: Check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
```

## What These Changes Do

### Add `billing_cycle`
- Stores whether subscription is 'monthly' or 'annual'
- Default: 'monthly'
- Not used for free trials

### Add `trial_started_at`
- Records when the 30-day trial started
- Used to calculate remaining trial days

### Add `trial_ends_at`
- Records when the 30-day trial expires
- Set to 30 days after `trial_started_at`

## How to Run

1. **Open Supabase Dashboard**
   - Go to supabase.com
   - Log in to your project
   - Click your project name

2. **Go to SQL Editor**
   - Left sidebar → SQL Editor

3. **Paste and Run**
   - Copy the SQL code above
   - Paste into SQL Editor
   - Click "Run" button (or Ctrl+Enter)

4. **Verify Success**
   - You should see results showing the table structure
   - All columns should be present

## Checking Results

After running migration, verify by querying:

```sql
SELECT *
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
```

You should see these columns:
- id
- user_id
- plan_type
- **billing_cycle** ✓ (newly added)
- status
- stripe_customer_id
- stripe_subscription_id
- **trial_started_at** ✓ (newly added)
- **trial_ends_at** ✓ (newly added)
- current_period_start
- current_period_end
- created_at
- updated_at

## Rollback (If Needed)

If something goes wrong, you can remove the columns:

```sql
ALTER TABLE public.subscriptions
DROP COLUMN IF EXISTS billing_cycle,
DROP COLUMN IF EXISTS trial_started_at,
DROP COLUMN IF EXISTS trial_ends_at;
```

Then run the original columns creation again.

## Next Steps

After database is updated:
1. Refresh your browser (Ctrl+Shift+R to hard refresh)
2. Clear browser cache if needed
3. Sign up for a new account
4. ✅ Should automatically create 30-day free trial
5. ✅ Badge should show "Free Trial (30 days left)"

---

**Status**: Run this immediately before testing the new pricing!
