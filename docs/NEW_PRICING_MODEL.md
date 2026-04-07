# LSIeduHub Pricing Model - Updated Week 3

## 📊 Pricing Structure

### Free Trial
- **Duration**: 30 days
- **Cost**: $0
- **Features**: Full access to all content and features
- **Profiles**: Unlimited
- **What's Included**:
  - All subjects and content
  - All interactive games
  - Full progress tracking
  - Unlimited student profiles
  - No payment required

### Member Plan
- **Model**: Pay per student profile per month
- **Pricing Tiers**:
  - 1st profile: **$5/month**
  - 2nd profile: **$9/month**
  - 3rd+ profiles: **$3/month each**
- **Examples**:
  - 1 profile = $5/month
  - 2 profiles = $14/month ($5 + $9)
  - 3 profiles = $17/month ($5 + $9 + $3)
  - 5 profiles = $23/month ($5 + $9 + $3 + $3 + $3)

### Annual Billing Discount
- **Offer**: Pay for 11 months, get 12 months
- **Applies to**: Same per-profile pricing when paying annually
- **Effective Pricing**:
  - 1 profile annual = $54.55/year (instead of $60)
  - 2 profiles annual = $127.27/year (instead of $168)
  - 5 profiles annual = $209.09/year (instead of $276)
- **Savings Example**: With 2 profiles, save $40.73/year

### Summary
```
✅ Start with 30-day FREE TRIAL
✅ After trial: Become a MEMBER
✅ Pay per profile (1st: $5, 2nd: $9, rest: $3)
✅ Add/remove profiles anytime
✅ Annual discount: Pay 11, get 12
✅ ALL content available to ALL members
✅ Unlimited profiles per account
```

---

## 🗄️ Database Schema Update

If upgrading from old schema, run this SQL in Supabase:

```sql
-- Add new columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update existing records
UPDATE public.subscriptions
SET billing_cycle = 'monthly'
WHERE billing_cycle IS NULL;
```

### Complete subscriptions table schema:
```
id: UUID (Primary Key)
user_id: UUID (References auth.users)
plan_type: VARCHAR (values: 'free', 'member')
billing_cycle: VARCHAR (values: 'monthly', 'annual', NULL for free trial)
status: VARCHAR (values: 'active', 'trial', 'cancelled', 'expired')
stripe_customer_id: VARCHAR (nullable, for Stripe integration)
stripe_subscription_id: VARCHAR (nullable, for Stripe integration)
trial_started_at: TIMESTAMP (when free trial started)
trial_ends_at: TIMESTAMP (when free trial expires - 30 days from start)
current_period_start: TIMESTAMP (billing period start)
current_period_end: TIMESTAMP (billing period end)
created_at: TIMESTAMP (auto-set)
updated_at: TIMESTAMP (auto-set)
```

---

## 🔄 User Journey

### Step 1: Sign Up
- User creates account
- Creates first student profile
- **Automatically enrolled in 30-day free trial**
- ✅ No payment required

### Step 2: Trial Phase (Days 1-30)
- User has full access to everything
- Can create unlimited profiles
- Can track progress
- Sees countdown timer: "X days remaining"
- Gets reminder to become member (optional at day 25+)

### Step 3: Trial Expiration
- Subscription status changes from `trial` to `expired`
- Access pauses (cannot use games/features)
- User sees: "Your trial has ended. Become a member to continue."

### Step 4: Become Member
- Click "Become Member" on dashboard
- Choose billing cycle: Monthly or Annual
- Cost calculated based on current profile count
- **Monthly**: Full amount monthly
- **Annual**: Full amount annually with 1-month discount
- Click "Start Membership"
- **TODO: Stripe integration** - Would redirect to checkout
- Currently: Mock subscription created immediately
- ✅ Membership activated

### Step 5: Member Phase
- Full access to all features
- Billed monthly or annually (based on choice)
- Cost automatically adjusts when adding/removing profiles
- Example: Start with 1 profile ($5), add 2nd profile = now $14/month

---

## 💳 Stripe Integration (Future)

### Files to Update When Ready

1. **`lib/subscription-service.ts`**
   - `convertTrialToMember()` function
   - Add Stripe API calls to create subscription

2. **`app/api/subscriptions/convert-trial/route.ts`**
   - Line ~40: Replace mock subscription with actual Stripe call
   - Get `stripe_customer_id` and `stripe_subscription_id`

3. **`app/pricing/page.tsx`**
   - Redirect to Stripe checkout instead of mock
   - Add Stripe Elements form (optional)

4. **Add webhook handler**
   - `app/api/webhooks/stripe/route.ts`
   - Listen for `customer.subscription.updated`, `customer.subscription.deleted`
   - Update subscription status in database

### Environment Variables
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Approximate Implementation Time
- Add Stripe SDK: 15 minutes
- Create checkout flow: 1-2 hours
- Add webhooks: 1-2 hours
- Testing: 1-2 hours
- **Total: ~4-6 hours**

---

## 📱 Testing the New System

### Test Scenario 1: Sign Up & Free Trial
```
1. Go to http://localhost:3000
2. Click "Sign Up Free"
3. Create account
4. Create first student profile
5. Land on dashboard
6. ✅ See "Free Trial (30 days left)" badge
7. ✅ See "30 Days" subscription card
8. ✅ See "Become Member" button
```

### Test Scenario 2: View Pricing
```
1. On dashboard, click "Manage Plan"
2. Go to Pricing page
3. ✅ See Free Trial & Member sections
4. ✅ See profile count slider (1-10)
5. ✅ See price updates as you change profile count
6. ✅ See Monthly/Annual toggle
7. ✅ See annual savings calculation
8. Example pricing:
   - 1 profile monthly: $5
   - 2 profiles monthly: $14
   - 5 profiles monthly: $23
   - 1 profile annual: $54.55 (save $5.45)
```

### Test Scenario 3: Become Member
```
1. Click "Become Member" button on pricing page
2. Choose billing cycle: Monthly or Annual
3. Select number of profiles (1-10)
4. Click "Become Member"
5. See: "Welcome! Your membership is now active."
6. Redirect to dashboard
7. ✅ Badge shows: "Member - Monthly" or "Member - Annual"
8. ✅ Cost shows: "$X.XX/month" based on profiles
```

### Test Scenario 4: Profile Count & Cost
```
1. Member with 1 profile = $5/month
2. Add 2nd profile from dashboard
3. Wait for refresh
4. ✅ Subscription card shows: $14/month
5. Add 3rd profile
6. ✅ Now shows: $17/month
7. Add 5th profile
8. ✅ Now shows: $23/month
```

### Test Scenario 5: Verify Database
```
1. Go to Supabase Dashboard
2. Database → subscriptions table
3. Find your subscription record
4. Check fields:
   - plan_type: 'free' or 'member'
   - status: 'trial' or 'active'
   - billing_cycle: 'monthly' or 'annual'
   - trial_ends_at: 30 days from trial_started_at
```

---

## 🎯 Key Metrics

### Pricing Formula
```javascript
// For monthly billing:
monthlyTotal = firstProfileCost + secondProfileCost + additionalProfilesCost
             = $5 + $9 + ($3 × (count - 2))

// For annual billing:
annualRate = monthlyTotal × 12 / 11  // 1 month discount
annualTotal = annualRate × 12
savings = (monthlyTotal × 12) - annualTotal
```

### Example Calculations
```
1 Profile:
  Monthly: $5.00
  Annual: $54.55 (saves $5.45)

2 Profiles:
  Monthly: $14.00
  Annual: $127.27 (saves $40.73)

5 Profiles:
  Monthly: $23.00
  Annual: $209.09 (saves $50.91)

10 Profiles:
  Monthly: $38.00
  Annual: $345.45 (saves $84.55)
```

---

## 💡 Design Notes

### Why This Model?
- ✅ Simple and transparent
- ✅ Fair pricing (pay for what you use)
- ✅ Scales with family size
- ✅ Incentivizes annual commitment
- ✅ Easy to understand

### No Hidden Costs
- No setup fees
- No per-game fees
- No content restrictions
- No profile limits
- Cost only changes when you add/remove profiles

### Data Access
- ✅ All content available to all members
- ✅ No feature restrictions by profile
- ✅ All profiles access same data
- ✅ No content tiers (Beginner, Advanced, etc.)

---

## 📋 Differences from Old Model

### Old Model ❌
```
Free, Premium ($4.99), Family ($9.99)
Fixed per-plan pricing
Only 1 profile per tier
Limited features for free users
```

### New Model ✅
```
30-day Free Trial + Member (pay per profile)
1st: $5, 2nd: $9, 3rd+: $3 each
Unlimited profiles
Full features for all members
Annual discount: Pay 11, get 12
```

---

## 🚀 Next Steps

1. ✅ Test the pricing page with new model
2. ✅ Test profile count calculations
3. ✅ Verify trial creation on signup
4. ✅ Verify member conversion
5. ⏳ When ready: Integrate Stripe (straightforward swap)
6. ⏳ After Stripe: Enable real payment processing

---

**Status**: ✅ Week 3 (New Pricing Model) - Ready for Testing
